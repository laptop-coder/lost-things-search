import 'user.dart';

class Post {
  final String id;
  final String createdAt;
  final String updatedAt;
  final String name;
  final String? description;
  final bool verified;
  final bool thingReturnedToOwner;
  final bool hasPhoto;
  final User author;

  const Post({
    required this.id,
    required this.createdAt,
    required this.updatedAt,
    required this.name,
    this.description,
    required this.verified,
    required this.thingReturnedToOwner,
    required this.hasPhoto,
    required this.author,
  });

  factory Post.fromJson(Map<String, dynamic> json) => Post(
    id: json['id'] as String,
    createdAt: json['createdAt'] as String,
    updatedAt: json['updatedAt'] as String,
    name: json['name'] as String,
    description: json['description'] as String?,
    verified: json['verified'] as bool,
    thingReturnedToOwner: json['thingReturnedToOwner'] as bool,
    hasPhoto: json['hasPhoto'] as bool,
    author: User.fromJson(json['author'] as Map<String, dynamic>),
  );
}
