import os

target = "আরও প্রফেশনাল হবে".encode('utf-8')
target2 = "System Note".encode('utf-8')

for root, dirs, files in os.walk('.'):
    if 'node_modules' in dirs:
        dirs.remove('node_modules')
    for file in files:
        path = os.path.join(root, file)
        try:
            with open(path, 'rb') as f:
                content = f.read()
                if target in content:
                    print(f"Target 1 found in {path}")
                if target2 in content:
                    print(f"Target 2 found in {path}")
        except:
            pass
