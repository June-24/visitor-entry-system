import 'package:flutter/material.dart';
import 'package:qr_code_scanner_plus/qr_code_scanner_plus.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'QR Code Visitor Management',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
      ),
      home: const MyHomePage(),
    );
  }
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key});

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  Map<String, TextEditingController> controllers = {};
  bool isDataLoaded = false;
  Map<String, dynamic> visitorData = {};

  Future<void> submitData(String action) async {
  const String baseUrl = "http://43.204.142.131//api//";

  final Map<String, dynamic> requestData = {
    for (var entry in controllers.entries) entry.key: entry.value.text,
  };

  try {
    final response = await http.post(
      Uri.parse("$baseUrl$action"),
      headers: {"Content-Type": "application/json"},
      body: jsonEncode(requestData),
    );

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(response.statusCode == 201 ? "$action successful!" : "${response.body}")),
    );
  } catch (e) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text("Error: $e")),
    );
  }
}


  void _processQRData(String scannedData) {
    try {
      final Map<String, dynamic> jsonData = jsonDecode(scannedData);

      setState(() {
        visitorData = jsonData;
        controllers.clear();
        jsonData.forEach((key, value) {
          controllers[key] = TextEditingController(text: value.toString());
        });
        isDataLoaded = true;
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Invalid QR Code data!")),
      );
    }
  }

  Widget buildEditableField(String label, String key) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: TextField(
        controller: controllers[key],
        decoration: InputDecoration(
          labelText: label,
          border: OutlineInputBorder(),
        ),
      ),
    );
  }

void _clearData() {
  setState(() {
    visitorData.clear();
    controllers.clear();
    isDataLoaded = false;
  });
}


  @override
Widget build(BuildContext context) {
  return Scaffold(
    appBar: AppBar(title: const Text('QR Code Visitor Management')),
    body: Padding(
  padding: const EdgeInsets.all(16.0),
  child: SingleChildScrollView(
    child: Column(
      children: [
        // Image at the top
        SizedBox(
          width: MediaQuery.of(context).size.width * 0.9, // 12% of screen height
          child: Image.asset(
            'assets/erp.png',
            fit: BoxFit.cover,
          ),
        ),
        SizedBox(
          width: MediaQuery.of(context).size.width * 0.3, // 12% of screen height
          child: Image.asset(
            'assets/NITW.png',
            fit: BoxFit.cover,
          ),
        ),


        const SizedBox(height: 20),

        // Scan button centered
        Center(
          child: ElevatedButton(
            onPressed: () async {
              final scannedText = await Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const QRViewExample()),
              );

              if (scannedText != null) {
                _processQRData(scannedText);
              }
            },
            child: const Text("Scan QR Code"),
          ),
        ),

        const SizedBox(height: 20),

        // Scrollable list of input fields if data is loaded
        if (isDataLoaded)
          ListView(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(), // Disables nested scrolling issues
            children: [
              ...visitorData.keys.map((key) => buildEditableField(key, key)).toList(),
              const SizedBox(height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  ElevatedButton(
                    onPressed: () => submitData("entry"),
                    style: ElevatedButton.styleFrom(backgroundColor: Colors.green),
                    child: const Text("Admit", style: TextStyle(color: Colors.white)),
                  ),
                  ElevatedButton(
                    onPressed: () => submitData("exit"),
                    style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
                    child: const Text("Exit", style: TextStyle(color: Colors.white)),
                  ),
                  ElevatedButton(
                    onPressed: _clearData,  // Calls the function to reset the form
                    style: ElevatedButton.styleFrom(backgroundColor: Colors.blue),
                    child: const Text("Clear", style: TextStyle(color: Colors.white)),
                  ),
                ],
              ),
            ],
          ),
      ],
    ),
  ),
),

  );
}

}

class QRViewExample extends StatefulWidget {
  const QRViewExample({super.key});

  @override
  State<StatefulWidget> createState() => _QRViewExampleState();
}

class _QRViewExampleState extends State<QRViewExample> {
  final GlobalKey qrKey = GlobalKey(debugLabel: 'QR');
  QRViewController? controller;
  String? result;

  @override
  void dispose() {
    controller?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: <Widget>[
          Expanded(
            flex: 4,
            child: QRView(
              key: qrKey,
              onQRViewCreated: _onQRViewCreated,
              overlay: QrScannerOverlayShape(
                borderColor: Colors.blue,
                borderRadius: 10,
                borderLength: 30,
                borderWidth: 10,
                cutOutSize: MediaQuery.of(context).size.width * 0.8,
              ),
            ),
          ),
          Expanded(
            flex: 1,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (result != null)
                  Text(
                    "Scanned: $result",
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                const SizedBox(height: 10),
                ElevatedButton(
                  onPressed: () => Navigator.pop(context, result),
                  child: const Text("Go Back"),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _onQRViewCreated(QRViewController controller) {
    this.controller = controller;
    controller.scannedDataStream.listen((scanData) {
      setState(() {
        result = scanData.code;
      });

      if (result != null) {
        controller.pauseCamera();
        Navigator.pop(context, result);
      }
    });
  }
}
