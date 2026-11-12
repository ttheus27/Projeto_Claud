#!/usr/bin/env python3
"""Gera um ZIP de código da Function sem arquivos locais ou credenciais."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root = Path(__file__).resolve().parent.parent
source = root / 'functions'
target = root / 'dist' / 'functions.zip'
target.parent.mkdir(exist_ok=True)
with ZipFile(target, 'w', ZIP_DEFLATED) as archive:
    for name in ['host.json', 'package.json', 'package-lock.json']:
        archive.write(source / name, name)
    for file in sorted((source / 'src').rglob('*.js')):
        archive.write(file, file.relative_to(source))
print(target)
