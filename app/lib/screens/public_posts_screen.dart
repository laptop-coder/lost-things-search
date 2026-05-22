import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../services/auth_service.dart';
import '../services/permissions.dart';
import '../widgets/post_card_compact.dart';
import '../models/post.dart';

class PublicPostsScreen extends StatefulWidget {
  final ApiService api;
  final AuthService auth;
  final Permissions permissions;

  const PublicPostsScreen({
    super.key,
    required this.api,
    required this.auth,
    required this.permissions,
  });

  @override
  State<PublicPostsScreen> createState() => _PublicPostsScreenState();
}

class _PublicPostsScreenState extends State<PublicPostsScreen> {
  final List<Post> _posts = [];
  bool _loading = false;
  bool _hasMore = true;
  int _page = 0;
  String? _error;

  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _loadPosts();
    _scrollController.addListener(_onScroll);
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
            _scrollController.position.maxScrollExtent - 200 &&
        !_loading &&
        _hasMore) {
      _loadPosts();
    }
  }

  Future<void> _loadPosts() async {
    if (_loading || !_hasMore) return;
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final data = await widget.api.get(
        '/posts/public?author=all&thingReturnedToOwner=false&limit=10&offset=${_page * 10}',
      );
      final newPosts = (data['posts'] as List<dynamic>)
          .map((e) => Post.fromJson(e as Map<String, dynamic>))
          .toList();

      setState(() {
        _posts.addAll(newPosts);
        _page++;
        _hasMore = newPosts.length == 10;
        _loading = false;
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Ошибка загрузки объявлений')),
        );
      }
      setState(() {
        _error = 'Ошибка загрузки объявлений';
        _loading = false;
      });
    }
  }

  Future<void> _refresh() async {
    setState(() {
      _posts.clear();
      _page = 0;
      _hasMore = true;
    });
    await _loadPosts();
  }

  @override
  Widget build(BuildContext context) {
    if (_error != null && _posts.isEmpty) {
      return Center(child: Text(_error!));
    }
    return Center(
      child: Container(
        constraints: const BoxConstraints(maxWidth: 600),
        child: RefreshIndicator(
          onRefresh: _refresh,
          child: ListView.builder(
            controller: _scrollController,
            itemCount: _posts.length + (_hasMore ? 1 : 0),
            itemBuilder: (context, index) {
              if (index == _posts.length) {
                return const Padding(
                  padding: EdgeInsets.all(16),
                  child: Center(child: CircularProgressIndicator()),
                );
              }
              return PostCardCompact(
                post: _posts[index],
                api: widget.api,
                auth: widget.auth,
                permissions: widget.permissions,
                onChanged: _refresh,
              );
            },
          ),
        ),
      ),
    );
  }
}
