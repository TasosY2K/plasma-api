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
			print('[+] ' + ip)
			x = requests.post("http://localhost:3000/devices/" + ip)
			print(x.text)
		else:
			print('[-] ' + ip)
	except:
		pass

def Loop():
	while True:
		Check(GetIP())

if __name__ == '__main__':
	for i in range(75):
		threading.Thread(target=Loop).start()