import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../services/auth_service.dart';
import '../services/permissions.dart';
import '../screens/public_posts_screen.dart';

class MainNavigationBar extends StatefulWidget {
  final ApiService api;
  final AuthService auth;
  final Permissions permissions;

  const MainNavigationBar({
    super.key,
    required this.api,
    required this.auth,
    required this.permissions,
  });

  @override
  State<MainNavigationBar> createState() => _MainNavigationBarState();
}

class _MainNavigationBarState extends State<MainNavigationBar> {
  int currentPageIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        // Avatar (profile button)
        actions: [
          if (widget.auth.user != null)
            GestureDetector(
              onTap: () => Navigator.of(context).pushNamed('/profile'),
              child: Padding(
                padding: const EdgeInsets.all(8),
                child: CircleAvatar(
                  backgroundImage: widget.auth.user!.hasAvatar
                      ? NetworkImage(
                          '${widget.api.baseHost}/storage/storage/avatars/${widget.auth.user!.id}.jpeg',
                        )
                      : const AssetImage('assets/default_avatar.jpeg')
                            as ImageProvider,
                ),
              ),
            )
          else
            TextButton(
              onPressed: () => Navigator.of(context).pushNamed('/login'),
              child: const Text('Войти'),
            ),
        ],
      ),
      body: <Widget>[
        Center(
          child: PublicPostsScreen(
            api: widget.api,
            auth: widget.auth,
            permissions: widget.permissions,
          ),
        ),
        if (widget.permissions.hasPermission(PERMISSIONS.CONVERSATION_READ_OWN))
          const Center(child: Text('Сообщения')),
        if (widget.permissions.hasAnyRole([ROLES.ADMIN, ROLES.SUPERADMIN]))
          const Center(child: Text('Управление')),
        if (widget.auth.user != null)
          const Center(child: Text('Личный кабинет'))
        else
          const Center(child: Text('Войдите в учётную запись')),
      ][currentPageIndex],
      bottomNavigationBar: NavigationBar(
        onDestinationSelected: (int index) {
          setState(() {
            currentPageIndex = index;
          });
        },
        indicatorColor: Colors.blue.shade100,
        selectedIndex: currentPageIndex,
        destinations: <Widget>[
          const NavigationDestination(
            selectedIcon: Icon(Icons.home),
            icon: Icon(Icons.home_outlined),
            label: 'Объявления',
          ),
          if (widget.permissions.hasPermission(
            PERMISSIONS.CONVERSATION_READ_OWN,
          ))
            const NavigationDestination(
              selectedIcon: Icon(Icons.chat),
              icon: Icon(Icons.chat_outlined),
              label: 'Сообщения',
            ),
          if (widget.permissions.hasAnyRole([ROLES.ADMIN, ROLES.SUPERADMIN]))
            const NavigationDestination(
              selectedIcon: Icon(Icons.settings),
              icon: Icon(Icons.settings_outlined),
              label: 'Управление',
            ),
          const NavigationDestination(
            selectedIcon: Icon(Icons.account_circle),
            icon: Icon(Icons.account_circle_outlined),
            label: 'Личный кабинет',
          ),
        ],
      ),
    );
  }
}
