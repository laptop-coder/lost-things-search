import 'user.dart';
import 'post.dart';
import 'message.dart';

class Conversation {
  final String id;
  final String createdAt;
  final Post post;
  final List<Message> messages;
  final User otherUser;

  const Conversation({
    required this.id,
    required this.createdAt,
    required this.post,
    required this.messages,
    required this.otherUser,
  });

  factory Conversation.fromJson(Map<String, dynamic> json) => Conversation(
    id: json['id'] as String,
    createdAt: json['createdAt'] as String,
    post: Post.fromJson(json['post'] as Map<String, dynamic>),
    messages:
        (json['messages'] as List<dynamic>?)
            ?.map((e) => Message.fromJson(e as Map<String, dynamic>))
            .toList() ??
        [],
    otherUser: User.fromJson(json['otherUser'] as Map<String, dynamic>),
  );
}
