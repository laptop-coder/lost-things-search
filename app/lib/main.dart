import 'package:flutter/material.dart';

void main() {
  runApp(const LostThingsSearchApp());
}

class LostThingsSearchApp extends StatelessWidget {
  const LostThingsSearchApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'LostThingsSearch',
      theme: ThemeData(colorScheme: .fromSeed(seedColor: Colors.blue.shade300)),
      home: const PublicPostsPage(title: 'LostThingsSearch'),
    );
  }
}

class PublicPostsPage extends StatefulWidget {
  const PublicPostsPage({super.key, required this.title});
  final String title;

  @override
  State<PublicPostsPage> createState() => _PublicPostsPageState();
}

class _PublicPostsPageState extends State<PublicPostsPage> {
  int _counter = 0;

  void _incrementCounter() {
    setState(() {
      // This call to setState tells the Flutter framework that something has
      // changed in this State, which causes it to rerun the build method below
      // so that the display can reflect the updated values. If we changed
      // _counter without calling setState(), then the build method would not be
      // called again, and so nothing would appear to happen.
      _counter++;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        title: Text(widget.title),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: .center,
          children: [
            const Text('You have pushed the button this many times:'),
            Text(
              '$_counter',
              style: Theme.of(context).textTheme.headlineMedium,
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _incrementCounter,
        tooltip: 'Increment',
        child: const Icon(Icons.add),
      ),
    );
  }
}
