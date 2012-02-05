<?php

class BackendStub {
	

	public function runLess($less) {
		$lessFile = './temp/backend.less';
		$cssFile = './temp/backend.css';

		echo file_get_contents($cssFile);
	}
}

$bs = new BackendStub();
$bs->runLess($_POST['less']);

?>