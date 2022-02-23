<?php

class Custom_lib{

    var $CI;
    public function __construct()
    {
            $this->CI = &get_instance(); 
    }

    public function show_response($response) {
        $msg = '';
        if(isset($response['data']) && count($response['data']) > 0)
        {
            foreach($response['data'] as $data)
            {
                $msg .= $data['msg'].'<br />';
            }
        }else{
                $msg = $response['message'];
        }
        $this->CI->session->set_flashdata('msgtype', 'danger');                        
        $this->CI->session->set_flashdata('message',$msg);
    }
}