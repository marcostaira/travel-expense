import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

import 'src/core/config/app_config.dart';
import 'src/core/providers/auth_provider.dart';
import 'src/core/providers/theme_provider.dart';
import 'src/core/router/app_router.dart';
import 'src/core/theme/app_theme.dart';
import 'src/core/l10n/app_localizations.dart';
import 'src/core/services/storage_service.dart';
import 'src/core/services/sync_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize configuration
  await AppConfig.initialize();

  // Initialize storage service
  await StorageService.instance.initialize();

  // Initialize sync service
  await SyncService.instance.initialize();

  runApp(ProviderScope(child: TravelExpenseApp()));
}

class TravelExpenseApp extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final themeMode = ref.watch(themeModeProvider);
    final authState = ref.watch(authProvider);
    final router = ref.watch(appRouterProvider);

    return MaterialApp.router(
      title: 'Travel Expense Manager',
      debugShowCheckedModeBanner: false,

      // Theming
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: themeMode,

      // Localization
      localizationsDelegates: const [
        AppLocalizations.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [Locale('pt', 'BR'), Locale('en', 'US')],
      locale: const Locale('pt', 'BR'),

      // Routing
      routerConfig: router,

      // Builder for global configurations
      builder: (context, child) {
        return MediaQuery(
          // Disable text scaling for consistent UI
          data: MediaQuery.of(
            context,
          ).copyWith(textScaleFactor: 1.0, boldText: false),
          child: child ?? const SizedBox.shrink(),
        );
      },
    );
  }
}
