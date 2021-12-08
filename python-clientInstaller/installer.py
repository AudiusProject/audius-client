from pyuac import main_requires_admin
from os import path, scandir, system, name, remove, getenv
from io import BytesIO
from urllib.request import urlopen
from zipfile import ZipFile
import sys
import requests
import base64

AUDIUS_PATH = path.join(path.expandvars(r'%LOCALAPPDATA%'), "Programs", "audius-client")
LATEST_PATH = "https://audius-asheversion.s3.eu-west-1.amazonaws.com/latest.zip"
AUDIUS_LINK = "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"

def download():
    system('cls' if name == 'nt' else 'clear')
    file_name = "latest.zip"
    with open(file_name, "wb") as f:
        print("Downloading Client...")
        response = requests.get(LATEST_PATH, stream=True)
        total_length = response.headers.get('content-length')

        if total_length is None: # no content length header
            f.write(response.content)
        else:
            dl = 0
            total_length = int(total_length)
            for data in response.iter_content(chunk_size=4096):
                dl += len(data)
                f.write(data)
                done = int(50 * dl / total_length)
                sys.stdout.write("\r[%s%s]" % ('=' * done, ' ' * (50-done)) )    
                sys.stdout.flush()
    with ZipFile(file_name, "r") as zfile:
        zfile.extractall(AUDIUS_PATH)
    remove("latest.zip")
    lnk_path = path.join(getenv('APPDATA'), "Microsoft", "Windows", "Start Menu", "Programs", "Audius.lnk")
    if not path.exists(lnk_path):
        print("Did not find start menu shortcut for Audius. Creating one...")
        try:
            file_content=base64.b64decode(AUDIUS_LINK)
            with open(lnk_path, "wb") as f:
                f.write(file_content)
        except Exception as e:
            print(str(e))

@main_requires_admin
def main():
    if path.exists(AUDIUS_PATH) == True:
        SOURCE_FILES = []
        with scandir(AUDIUS_PATH) as i:
            for entry in i:
                if entry.is_file():
                    SOURCE_FILES.append(entry.path)
        print(f"Audius Installation was found at expected directory ({AUDIUS_PATH})! Installing custom build...")
        print("Removing old folder...")
        for i in range(len(SOURCE_FILES)-1):
            print(f"Removing files... {i}/{len(SOURCE_FILES)-1}")
            system("del /f /q " + SOURCE_FILES[i])
        print("Removing folder...")
        system("rmdir /s /q " + AUDIUS_PATH)
        print("Finished removing old folder! Installing new folder...")
    else:
        print(f"Audius Installation could not be found at expected directory ({AUDIUS_PATH}). Installing custom build...")
    try:
        download()
        input("Installation complete! Press enter to exit...")
    except Exception as e:
        input(f"Installation failed! Full traceback: {e} Press enter to exit...")

main()