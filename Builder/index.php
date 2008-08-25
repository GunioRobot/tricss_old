<?php

include('./jsmin.php');


abstract class Builder {
	
	public static $build = 'undefined';
	private static $commits = array();
	private static $files = array();
	public static $minify = array();
	public static $pathToRoot = '../';
	public static $save = array();
	
	public static function initialize(){
		self::$minify = array_key_exists('minify', $_GET);
		self::$save = array_key_exists('save', $_GET);
		
		$commit = self::getLatestCommit();
		$id = $commit['id'];
		
		$from = 0;
		for ($i = 0, $l = strlen($id); $i < $l; $i++){
			$char = $id[$i];
			if (is_numeric($char)){
				$from = (int) $char;
				break;
			}
		}
				
		self::$build = substr($id, $from, 3) . substr($id, -3);
	}
	
	public static function addFiles(){
		$files = func_get_args();
		foreach($files as $file){
			self::$files[] = self::$pathToRoot . $file;
		}
	}
	
	public static function getCommits(){
		if (count(self::$commits) == 0){
			$markup = self::read('http://github.com/api/v1/json/chrisschneider/tricss/commits/master', 'r');		
			$json = json_decode($markup, true);
			self::$commits = $json['commits'];
		}
		
		return self::$commits;
	}
	
	public static function getLatestCommit(){
		$commits = self::getCommits();
		return $commits[0];
	}
	
	public static function kickOff(){
		$code = '';
		
		foreach(self::$files as $file){
			if (file_exists($file)){
				$code .= self::read($file) . "\n\n\n";
			} else {
				die("File {$file} not found!");
			}
		}
		
		$code = str_replace('%build%', self::$build, $code);
		
		preg_match("/version: '([^']+)/", $code, $match);
		$version = $match[1];
		
		if (self::$minify){
			$code = JSMin::minify($code);
		}

		if (self::$save){
			header("Content-Disposition: Attachment; Filename=Tricss-{$version}.js");
		}

		header('Content-Type: text/javascript');

		echo $code;
	}
	
	public static function read($url){
		$result = '';
		$fp = fopen($url, 'r');
		while ($text = fread($fp, 1024)){
			$result .= $text;
		}
		fclose($fp);
		return $result;
	}
}

Builder::initialize();

Builder::addFiles(
	'Source/Tricss.js',
	'Source/Tricss.Document.js',
	'Source/Tricss.Event.js',
	'Source/Tricss.Parser.js',
	'Source/Tricss.Rule.js',
	'Source/Tricss.Selector.js',
	'Source/Tricss.Style.js'
);


Builder::kickOff();

?>