import 'package:flutter/material.dart';
import '../models/post.dart';
import '../services/api_service.dart';
import '../services/auth_service.dart';
import '../services/permissions.dart';
import 'package:intl/intl.dart';

class PostCardCompact extends StatelessWidget {
  final Post post;
  final ApiService api;
  final AuthService auth;
  final Permissions permissions;
  final VoidCallback onChanged;

  const PostCardCompact({
    super.key,
    required this.post,
    required this.api,
    required this.auth,
    required this.permissions,
    required this.onChanged,
  });

  String _formatDate(String dateStr) {
    return (DateFormat('dd.MM.yyyy', 'ru').format(DateTime.parse(dateStr)));
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  radius: 16,
                  backgroundImage: post.author.hasAvatar
                      ? NetworkImage(
                          '${api.baseHost}/storage/storage/avatars/${post.author.id}.jpeg',
                        )
                      : const AssetImage('assets/default_avatar.jpeg')
                            as ImageProvider,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '${post.author.firstName} ${post.author.lastName}',
                        style: TextStyle(
                          fontWeight: FontWeight.w500,
                          color: colorScheme.onSurface,
                        ),
                      ),
                      Text(
                        _formatDate(post.updatedAt),
                        style: TextStyle(
                          fontSize: 12,
                          color: colorScheme.outline,
                        ),
                      ),
                    ],
                  ),
                ),
                if (post.thingReturnedToOwner)
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 2,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.green.shade100,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      'Найдено',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.green.shade700,
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              post.name,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: colorScheme.onSurface,
              ),
            ),
            const SizedBox(height: 4),

            if (post.description != null && post.description!.isNotEmpty)
              Text(
                post.description!,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(color: colorScheme.onSurfaceVariant),
              ),

            if (post.hasPhoto)
              Padding(
                padding: const EdgeInsets.only(top: 8),
                child: Center(
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: Image.network(
                      '${api.baseHost}/storage/storage/post_photos/${post.id}.jpeg',
                      height: 300,
                      fit: BoxFit.contain,
                      errorBuilder: (_, _, _) => const SizedBox.shrink(),
                    ),
                  ),
                ),
              ),
            const SizedBox(height: 8),

            Row(
              children: [
                TextButton(
                  onPressed: () =>
                      Navigator.of(context).pushNamed('/posts/${post.id}'),
                  child: const Text('Подробнее'),
                ),
                const Spacer(),
                if (auth.user != null &&
                    auth.user!.id != post.author.id &&
                    permissions.hasPermission(PERMISSIONS.CONVERSATION_CREATE))
                  FilledButton.tonal(
                    onPressed: () {
                      // TODO: open send message dialog
                    },
                    child: const Text('Связаться'),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
