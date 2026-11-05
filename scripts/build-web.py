import os
import shutil

www_dir = 'www'
if os.path.exists(www_dir):
    shutil.rmtree(www_dir)
os.makedirs(www_dir)

files_to_copy = [
    'index.html',
    'styles.css',
    'script.js',
    'format-utils.mjs',
    'revenue-config.js',
    'sponsorship.js',
    'manifest.json',
    'sw.js',
    'supported-platforms.html',
    'privacy.html',
    'terms.html',
    'contact.html',
    'copyright.html',
    '404.html'
]

for filename in files_to_copy:
    if os.path.exists(filename):
        shutil.copy(filename, os.path.join(www_dir, filename))

if os.path.exists('assets'):
    shutil.copytree('assets', os.path.join(www_dir, 'assets'))

print("Frontend assets bundled into www/ successfully.")
