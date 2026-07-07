import os
import pyresparser

def patch_file(utils_path):
    if not os.path.exists(utils_path):
        print(f"File not found: {utils_path}")
        return
    txt = open(utils_path).read()
    old = "matcher.add('NAME', None, *pattern)"
    new = "matcher.add('NAME', [cs.NAME_PATTERN])"
    if old in txt:
        txt = txt.replace(old, new)
        open(utils_path, 'w').write(txt)
        print(f"Patched successfully: {utils_path}")
    else:
        print(f"Pattern not found in: {utils_path}")

# Patch venv package
venv_pkg = os.path.dirname(pyresparser.__file__)
patch_file(os.path.join(venv_pkg, 'utils.py'))

# Patch local workspace package
local_pkg = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'pyresparser')
patch_file(os.path.join(local_pkg, 'utils.py'))