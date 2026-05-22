import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'screens/server_connect_screen.dart';
import 'screens/login_screen.dart';
import 'services/api_service.dart';
import 'services/auth_service.dart';
import 'services/permissions.dart';
import 'widgets/main_navigation_bar.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final api = await ApiService.create();
  final auth = AuthService(api);
  final permissions = Permissions(auth);

  final prefs = await SharedPreferences.getInstance();
  final savedHost = prefs.getString('server_host');

  runApp(
    LostThingsSearchApp(
      api: api,
      auth: auth,
      permissions: permissions,
      initialRoute: savedHost != null ? '/home' : '/connect_server',
    ),
  );
}

class LostThingsSearchApp extends StatelessWidget {
  final ApiService api;
  final AuthService auth;
  final Permissions permissions;
  final String initialRoute;

  const LostThingsSearchApp({
    super.key,
    required this.api,
    required this.auth,
    required this.permissions,
    required this.initialRoute,
  });

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'LostThingsSearch',
      initialRoute: initialRoute,
      routes: {
        '/connect_server': (_) =>
            ServerConnectScreen(title: 'LostThingsSearch'),
        '/login': (_) =>
            LoginScreen(api: api, auth: auth, permissions: permissions),
        '/home': (_) =>
            MainNavigationBar(api: api, auth: auth, permissions: permissions),
      },
      theme: ThemeData(
        colorScheme: .fromSeed(seedColor: Color(0xFF155DFC)),
        filledButtonTheme: FilledButtonThemeData(
          style: FilledButton.styleFrom(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            minimumSize: const Size(double.infinity, 48),
          ),
        ),
      ),
      localizationsDelegates: [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: [Locale('ru')],
    );
  }
}
