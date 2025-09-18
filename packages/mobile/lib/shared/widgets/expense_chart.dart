import 'package:flutter/material.dart';

class ExpenseChart extends StatelessWidget {
  const ExpenseChart({super.key});

  @override
  Widget build(BuildContext context) {
    // Mock data for demonstration
    final categories = [
      {'name': 'Alimentação', 'value': 1200.0, 'color': Colors.blue},
      {'name': 'Hospedagem', 'value': 800.0, 'color': Colors.green},
      {'name': 'Transporte', 'value': 600.0, 'color': Colors.orange},
      {'name': 'Outros', 'value': 400.0, 'color': Colors.purple},
    ];

    final total = categories.fold<double>(
      0,
      (sum, cat) => sum + cat['value'] as double,
    );

    return Column(
      children: [
        // Chart placeholder (in a real app, use a charting library like fl_chart)
        Container(
          height: 100,
          decoration: BoxDecoration(
            color: Colors.grey.shade200,
            borderRadius: BorderRadius.circular(8),
          ),
          child: const Center(
            child: Text(
              'Gráfico de Pizza\n(Gastos por Categoria)',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey),
            ),
          ),
        ),
        const SizedBox(height: 16),

        // Legend
        ...categories.map((category) {
          final percentage = ((category['value'] as double) / total * 100)
              .toStringAsFixed(1);
          return Padding(
            padding: const EdgeInsets.symmetric(vertical: 4),
            child: Row(
              children: [
                Container(
                  width: 12,
                  height: 12,
                  decoration: BoxDecoration(
                    color: category['color'] as Color,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    category['name'] as String,
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ),
                Text(
                  '$percentage%',
                  style: Theme.of(
                    context,
                  ).textTheme.bodySmall?.copyWith(fontWeight: FontWeight.bold),
                ),
                const SizedBox(width: 8),
                Text(
                  'R\$ ${(category['value'] as double).toStringAsFixed(2)}',
                  style: Theme.of(context).textTheme.bodySmall,
                ),
              ],
            ),
          );
        }).toList(),
      ],
    );
  }
}
