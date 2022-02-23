<?php

if (!defined('BASEPATH')) {
    exit('No direct script access allowed');
}

/* ------------------------------ */
/* ------------------------------ */

function ValidateUserAccess($PermittedModules, $Path) {
    if (!empty($PermittedModules)) {
        foreach ($PermittedModules as $Value) {
            if ($Value['ModuleName'] == $Path) {
                return $Value;
            }
        }
    }
    $Obj = & get_instance();
    $Obj->session->sess_destroy();
    exit("You do not have permission to access this module.");
    return false;
}

/* ------------------------------ */
/* ------------------------------ */

function APICall($URL, $JSON = NULL) {
    $CH = curl_init();
    $Headers = array('Accept: application/json', 'Content-Type: application/json', "Authorization: Bareer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYwZGMyZjkzZDBiNTAzMzIyMTUyZTZiMSIsImZ1bGxOYW1lIjoiYWRtaW4iLCJlbWFpbCI6ImFkbWluMDA3QGdtYWlsLmNvbSIsInVzZXJuYW1lIjpudWxsLCJwaG9uZU5vIjoiOTgwMDAwMDAwMCIsInN0YXR1cyI6ZmFsc2UsImlhdCI6MTYyNTA0MjkyNiwiZXhwIjoxNjI3NjM0OTI2fQ.N3v7L-VfiqbdyDPBzSz9TcFCxxvyoidscNUUYWxqv7s");
    $OP_DATA = $JSON;
    if($JSON == NULL){
        $OP_DATA = json_encode(array(
//                "Content-Type" => "application/x-www-form-urlencoded",
    //            "Authorization" => "Bareer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYwZGMyZjkzZDBiNTAzMzIyMTUyZTZiMSIsImZ1bGxOYW1lIjoiYWRtaW4iLCJlbWFpbCI6ImFkbWluMDA3QGdtYWlsLmNvbSIsInVzZXJuYW1lIjpudWxsLCJwaG9uZU5vIjoiOTgwMDAwMDAwMCIsInN0YXR1cyI6ZmFsc2UsImlhdCI6MTYyNTA0MjkyNiwiZXhwIjoxNjI3NjM0OTI2fQ.N3v7L-VfiqbdyDPBzSz9TcFCxxvyoidscNUUYWxqv7s",
        ));
    }
    curl_setopt($CH, CURLOPT_URL, $URL);
    curl_setopt($CH, CURLOPT_POSTFIELDS, $OP_DATA);
    curl_setopt($CH, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($CH, CURLOPT_CONNECTTIMEOUT, 50);
    curl_setopt($CH, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($CH, CURLOPT_HTTPHEADER, $Headers);
    curl_setopt($CH, CURLOPT_USERAGENT, $_SERVER['HTTP_USER_AGENT']);

    $Response = curl_exec($CH);

    $Response = json_decode($Response, true);
    curl_close($CH);
    return $Response;
}

/* ------------------------------ */
/* ------------------------------ */
if (!function_exists('response')) {

    function response($data) {
        header('Content-type: application/json');
        echo json_encode($data/* ,JSON_NUMERIC_CHECK */);
        exit;
    }

}

/* ------------------------------ */
if (!function_exists('convertEstDateTime')) {

    function convertEstDateTime($Datetime="") {
        $from = 'UTC';
        $to = 'America/New_York';
        $format = 'Y-m-d H:i:s';
        $date = $Datetime; // UTC time
        date_default_timezone_set($from);
        $newDatetime = strtotime($date);
        date_default_timezone_set($to);
        $newDatetime = date($format, $newDatetime);
        date_default_timezone_set('UTC');
        return $newDatetime; //EST time
    }

}


/* ------------------------------ */
/* ------------------------------ */
if (!function_exists('footballGetConfiguration')) {

    function footballGetConfiguration($Key) {
        $Football = array();
        $Football['ProFootballRegularSeasonOwners'] = array(
            array('Owners' => 4, "RosterSize" => 6, "Start" => 4, "Batch" => 2),
            array('Owners' => 5, "RosterSize" => 5, "Start" => 4, "Batch" => 1),
            array('Owners' => 6, "RosterSize" => 4, "Start" => 3, "Batch" => 1),
            array('Owners' => 7, "RosterSize" => 4, "Start" => 3, "Batch" => 1),
            array('Owners' => 8, "RosterSize" => 4, "Start" => 3, "Batch" => 1)
        );

        $Football['ProFootballPlayoffs'] = array(
            array('Owners' => 2, "RosterSize" => 6, "Start" => 6, "Batch" => 0),
            array('Owners' => 3, "RosterSize" => 4, "Start" => 4, "Batch" => 0),
            array('Owners' => 4, "RosterSize" => 3, "Start" => 3, "Batch" => 0)
        );

        $Football['CollegeFootballRegularSeason'] = array(
            array('Owners' => 6, "RosterSize" => 10, "Start" => 8, "Batch" => 2),
            array('Owners' => 7, "RosterSize" => 10, "Start" => 7, "Batch" => 3),
            array('Owners' => 8, "RosterSize" => 10, "Start" => 6, "Batch" => 4),
            array('Owners' => 9, "RosterSize" => 9, "Start" => 5, "Batch" => 3),
            array('Owners' => 10, "RosterSize" => 8, "Start" => 5, "Batch" => 3),
            array('Owners' => 11, "RosterSize" => 8, "Start" => 5, "Batch" => 3),
            array('Owners' => 12, "RosterSize" => 8, "Start" => 5, "Batch" => 3)
        );

        $Football['CollegeFootballPower5RegularSeason'] = array(
            array('Owners' => 6, "RosterSize" => 6, "Start" => 4, "Batch" => 2),
            array('Owners' => 7, "RosterSize" => 6, "Start" => 4, "Batch" => 2),
            array('Owners' => 8, "RosterSize" => 6, "Start" => 4, "Batch" => 2)
        );

        $Football['CollegeFootballBowlsAfterSeason'] = array(
            array('Owners' => 6, "RosterSize" => 10, "Start" => 10, "Batch" => 0),
            array('Owners' => 7, "RosterSize" => 8, "Start" => 8, "Batch" => 0),
            array('Owners' => 8, "RosterSize" => 8, "Start" => 8, "Batch" => 0)
        );

        return (isset($Football[$Key])) ? $Football[$Key] : array();
    }

 
    // Show Response Message

    
}

