import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'screens/server_connect_screen.dart';
import 'screens/public_posts.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final prefs = await SharedPreferences.getInstance();
  final savedHost = prefs.getString('server_host');

  runApp(
    LostThingsSearchApp(initialRoute: savedHost != null ? '/home' : '/connect_server'),
  );
}

class LostThingsSearchApp extends StatelessWidget {
  final String initialRoute;

  const LostThingsSearchApp({super.key, required this.initialRoute});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'LostThingsSearch',
      initialRoute: initialRoute,
      routes: {
        '/connect_server': (_) => const ServerConnectScreen(title: 'LostThingsSearch'),
        '/home': (_) => const PublicPostsPage(title: 'LostThingsSearch'),
      },
      theme: ThemeData(colorScheme: .fromSeed(seedColor: Colors.blue.shade300)),
    );
  }
}
