<?php

require_once('MySQL.php');

class DocAccessorMySql {

	private $db;
	
	public function __construct($host, $dbname, $username, $password) {
		$db = new MySQL($host, $dbname, $username, $password);
	}

	private function saveWebpage($webPage) {
		$webPage['htmloptions'] = json_encode($webPage['htmloptions']);
		$webPage['cssoptions']  = json_encode($webPage['cssoptions']);
		$webPage['jsoptions']   = json_encode($webPage['jsoptions']);

		$this->db->insert($webPage, 'webpages');
	}

}

?>