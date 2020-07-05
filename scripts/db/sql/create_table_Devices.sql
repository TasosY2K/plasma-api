CREATE TABLE Devices (
  num SERIAL PRIMARY KEY,
  id VARCHAR(36),
  ip_address VARCHAR(15),
  status_code INTEGER,
  title VARCHAR(255),
  country VARCHAR(100),
  region VARCHAR(100),
  city VARCHAR(100),
  isp VARCHAR(100),
  location VARCHAR(100),
  time_located VARCHAR(100),
  image_path VARCHAR(100)
)