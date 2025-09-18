import 'package:equatable/equatable.dart';

class UserModel extends Equatable {
  final String id;
  final String email;
  final String name;
  final String role;
  final TenantModel tenant;

  const UserModel({
    required this.id,
    required this.email,
    required this.name,
    required this.role,
    required this.tenant,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'],
      email: json['email'],
      name: json['name'],
      role: json['role'],
      tenant: TenantModel.fromJson(json['tenant']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'role': role,
      'tenant': tenant.toJson(),
    };
  }

  @override
  List<Object?> get props => [id, email, name, role, tenant];
}

class TenantModel extends Equatable {
  final String id;
  final String name;
  final String cnpj;

  const TenantModel({required this.id, required this.name, required this.cnpj});

  factory TenantModel.fromJson(Map<String, dynamic> json) {
    return TenantModel(id: json['id'], name: json['name'], cnpj: json['cnpj']);
  }

  Map<String, dynamic> toJson() {
    return {'id': id, 'name': name, 'cnpj': cnpj};
  }

  @override
  List<Object?> get props => [id, name, cnpj];
}
