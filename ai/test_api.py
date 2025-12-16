import requests


# 1. The URL of your running backend
url = 'http://127.0.0.1:5000/api/upload'

# 2. Pick a real PDF file from your computer to test with
# REPLACE "test.pdf" with the actual name of a PDF in your folder
file_path = 'test.pdf' 

try:
    # Open the file and send it
    with open(file_path, 'rb') as f:
        print(f"Sending {file_path} to the AI...")
        files = {'file': f}
        response = requests.post(url, files=files)

    # 3. Check the result
    if response.status_code == 200:
        print("\nSUCCESS! The AI generated these questions:")
        print(response.json())
    else:
        print(f"\nFailed. Status Code: {response.status_code}")
        print("Error message:", response.text)

except FileNotFoundError:
    print(f"Error: Could not find the file '{file_path}'. Make sure a PDF is in the same folder.")
except Exception as e:
    print(f"Connection Error: {e}")
    print("Make sure your app.py is still running in the other terminal!")