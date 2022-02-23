<?php
defined('BASEPATH') OR exit('No direct script access allowed');
class Signin extends CI_Controller {

	/*------------------------------*/
	/*------------------------------*/	
	public function index()
	{
		if(count($_POST) > 0){
			$JSON = json_encode(array(
				"keyward" => $this->input->Post('Username'),
				"password" => $this->input->Post('Password'),
				"Source" => 'Direct',
				"deviceType" => 'Web',
                                "deviceToken" => "123",
                                "deviceID" => "123"
			));
			$Response = APICall(API_URL.'api/admin/login', $JSON); /* call API and get response */
                        if($Response['status'] == 1){ /*check for admin type user*/
				$this->session->set_userdata('UserData',$Response['data']); /* Set data in PHP session */
                                redirect('dashboard');
                                exit;
                        }else{
                            $this->session->set_flashdata('msgtype','danger');
                            $this->session->set_flashdata('message',$Response['message']);
                        }
                    }
		/* load view */
		$load['js']=array(
//			'asset/js/signin.js'
		);	
		$this->load->view('includes/header',$load);
		$this->load->view('signin/signin');
		$this->load->view('includes/footer');
        }
        
        public function signout(){
            $this->session->sess_destroy();
            redirect(base_url());
        }





}
