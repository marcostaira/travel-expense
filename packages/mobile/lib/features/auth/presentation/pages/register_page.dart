import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_form_builder/flutter_form_builder.dart';
import 'package:form_builder_validators/form_builder_validators.dart';
import 'package:go_router/go_router.dart';
import 'package:travel_expense_mobile/features/auth/data/providers/auth_provider.dart';
import 'package:travel_expense_mobile/shared/widgets/custom_button.dart';
import 'package:travel_expense_mobile/shared/widgets/custom_text_field.dart';

class RegisterPage extends ConsumerStatefulWidget {
  const RegisterPage({super.key});

  @override
  ConsumerState<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends ConsumerState<RegisterPage> {
  final _formKey = GlobalKey<FormBuilderState>();
  bool _isPasswordVisible = false;

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    
    ref.listen<AuthState>(authProvider, (previous, next) {
      if (next.isAuthenticated) {
        context.go('/dashboard');
      }
      
      if (next.error != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(next.error!),
            backgroundColor: Theme.of(context).colorScheme.error,
          ),
        );
      }
    });

    return Scaffold(
      appBar: AppBar(
        title: const Text('Criar Conta'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/login'),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: FormBuilder(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  'Registre sua empresa',
                  style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                Text(
                  'Preencha os dados para começar',
                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                    color: Colors.grey[600],
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 32),
                
                // Company name
                CustomTextField(
                  name: 'companyName',
                  label: 'Nome da Empresa',
                  prefixIcon: const Icon(Icons.business_outlined),
                  validator: FormBuilderValidators.required(
                    errorText: 'Nome da empresa é obrigatório',
                  ),
                ),
                const SizedBox(height: 16),
                
                // CNPJ
                CustomTextField(
                  name: 'cnpj',
                  label: 'CNPJ',
                  hint: '12.345.678/0001-90',
                  prefixIcon: const Icon(Icons.numbers_outlined),
                  validator: FormBuilderValidators.compose([
                    FormBuilderValidators.required(errorText: 'CNPJ é obrigatório'),
                    FormBuilderValidators.match(
                      r'^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}
