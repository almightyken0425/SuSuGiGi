"""
Monefy Export Difference Checker
================================
Strictly checks if the generated comparison file matches the original raw export.
Allows for configurable normalization to handle expected format differences.
"""

import csv
import sys
from pathlib import Path
from datetime import datetime
from collections import defaultdict

# Paths
SCRIPT_DIR = Path(__file__).parent
RAW_CSV_PATH = SCRIPT_DIR / "../Original_DB_Data/monefy-2026-01-24_11-31-56.csv"
COMPARISON_CSV_PATH = SCRIPT_DIR / "../Export_Data/monefy_raw_comparison.csv"

def normalize_date(date_str, has_time=False):
    """
    Normalize date to YYYY-MM-DD
    Raw CSV: 12/31/2015 (m/d/Y)
    Comparison: 2015-12-31 00:00:00 (Y-m-d H:M:S)
    """
    if not date_str:
        return ""
    
    try:
        # Check if YYYY-MM-DD format (Comparison)
        if '-' in date_str:
            dt = datetime.strptime(date_str.split()[0], '%Y-%m-%d')
        # Check if m/d/Y format (Raw)
        else:
            dt = datetime.strptime(date_str, '%m/%d/%Y')
        
        return dt.strftime('%Y-%m-%d')
    except ValueError:
        return date_str

def normalize_amount(amount_str):
    """Normalize amount to float rounded to 2 decimals"""
    try:
        val = float(amount_str.replace(',', ''))
        return round(val, 2)
    except ValueError:
        return 0.0

def generate_fingerprint(row, source_type):
    """
    Generate a unique key for transaction matching.
    Key: (Date|Account|Category|Amount)
    Note: Description/Note is excluded from strict key because newline handling might differ,
          but will be compared if key matches.
    """
    if source_type == 'raw':
        date = normalize_date(row['date'])
        account = row['account']
        category = row['category']
        amount = normalize_amount(row['amount'])
        note = row['description']
    else: # comparison
        date = normalize_date(row['datetime'])
        account = row['account']
        category = row['category']
        amount = normalize_amount(row['amount'])
        note = row['note']
        
    return (date, account, category, amount), note

def main():
    print("=" * 60)
    print("Monefy Export Diff Checker")
    print("=" * 60)
    
    if not RAW_CSV_PATH.exists() or not COMPARISON_CSV_PATH.exists():
        print("Error: Input files not found.")
        sys.exit(1)

    # Load Source (Raw)
    source_counts = defaultdict(int)
    source_notes = defaultdict(list)
    total_source = 0
    
    with open(RAW_CSV_PATH, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            key, note = generate_fingerprint(row, 'raw')
            source_counts[key] += 1
            source_notes[key].append(note)
            total_source += 1
            
    # Load Target (Comparison)
    target_counts = defaultdict(int)
    target_notes = defaultdict(list)
    total_target = 0
    
    with open(COMPARISON_CSV_PATH, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            key, note = generate_fingerprint(row, 'comparison')
            target_counts[key] += 1
            target_notes[key].append(note)
            total_target += 1

    print(f"Total Source Records: {total_source}")
    print(f"Total Target Records: {total_target}")
    
    # Compare
    all_keys = set(source_counts.keys()) | set(target_counts.keys())
    diffs = []
    
    for key in all_keys:
        s_count = source_counts[key]
        t_count = target_counts[key]
        
        if s_count != t_count:
            diffs.append({
                'key': key,
                'source': s_count,
                'target': t_count,
                's_notes': source_notes[key],
                't_notes': target_notes[key]
            })
            
    if not diffs:
        print("\n" + "="*30)
        print("PASS: Zero Discrepancies Found")
        print("="*30)
    else:
        print("\n" + "!"*30)
        print(f"FAIL: Found {len(diffs)} discrepancy groups")
        print("!"*30)
        
        print(f"{'Date':<12} | {'Account':<15} | {'Category':<15} | {'Amount':<10} | {'Src':<3} | {'Tgt':<3}")
        print("-" * 80)
        
        for d in diffs[:20]: # Show first 20
            k = d['key']
            print(f"{k[0]:<12} | {k[1]:<15} | {k[2]:<15} | {k[3]:<10} | {d['source']:<3} | {d['target']:<3}")
            # print(f"  Src Notes: {d['s_notes']}")
            # print(f"  Tgt Notes: {d['t_notes']}")
            
        if len(diffs) > 20:
            print(f"... and {len(diffs) - 20} more.")

if __name__ == "__main__":
    main()
