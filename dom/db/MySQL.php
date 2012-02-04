<?php

class MySQL {
	
	private $host;
	private $dbname;
	private $username;
	private $password;
	
	public function __construct($host, $dbname, $username, $password) {
		$this->host = $host;
		$this->dbname = $dbname;
		$this->username = $username;
		$this->password = $password;
	}
	
	/***************
	DB FUNCTIONS
	****************/

	private function loadConnection() {
		if(!$this->conn) {
			$this->conn = mysql_connect($this->host, $this->username, $this->password);
		}

		if(!mysql_select_db($this->dbname, $this->conn)) {
			throw new Exception('Unable to connect to DB');
		}
	}

	private function nonquery($sql) {
		$this->loadConnection();

		$rs = mysql_query($sql, $this->conn);

		if(!$rs) {
			throw new Exception('Unable to query database');
		}

		settype($rs, "null");
	}

	private function insert($data, $tableName) {
		$names = '';
		$values = '';
	
		foreach($data as $key => $value) {
			$value = ($value == '') ? 'NULL' : $value;
		
			$names .= $key.',';
			$values .= $value.',';
		}
		
		$values = preg_replace("/,$/", "", $values);
		$names = preg_replace("/,$/", "", $names);

		$sql = 'INSERT INTO '. $tableName .' ('.$names.') VALUES ('.$values.')';

		return $this->nonquery($sql);
	}

}

?>