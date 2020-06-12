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
			print('[+] http://' + ip)
			try:
				x = requests.post("http://localhost:3000/devices/" + ip, timeout=30)
				if x.status_code == 201:
					print('[↑] http://' + ip)
				else:
					print('[-] ' + x.text)
			except:
				pass
		else:
			print('[-] http://' + ip)
	except:
		pass

def Loop():
	while True:
		Check(GetIP())

if __name__ == '__main__':
	for i in range(75):
		threading.Thread(target=Loop).start()