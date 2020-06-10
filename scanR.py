import requests
import random
import threading

def GetIP():
	ip = ""
	ip += str(random.randint(1,255)) + "."
	ip += str(random.randint(1,255)) + "."
	ip += str(random.randint(1,255)) + "."
	ip += str(random.randint(1,255))
	return ip

def Check(ip):
	try:
		req = requests.get("http://" + ip, timeout=10, allow_redirects=True)
		if req.status_code == 200:
			title = req.text.split("<title>")[1].split("</title>")[0]
			print(f"[+] {ip} | {title} | {req.status_code} ")
		else:
			pass
	except:
		pass

def Loop():
	while True:
		Check(GetIP())

if __name__ == '__main__':
	for i in range(75):
		threading.Thread(target=Loop).start()