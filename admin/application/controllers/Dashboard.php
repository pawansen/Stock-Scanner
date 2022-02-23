<?php
defined('BASEPATH') OR exit('No direct script access allowed');
class Dashboard extends CI_Controller {
	
	/*------------------------------*/
	/*------------------------------*/	
	public function index()
	{
		$load['css']=array();
		$load['js']=array();

		/* load view */
//		$load['js']=array(
//			'asset/js/dashboard.js',
//		);
//                echo "<pre>";
//                print_r($this->session->userdata());
		$this->load->view('includes/header',$load);
		$this->load->view('includes/menu');
		$this->load->view('dashboard/dashboard');
		$this->load->view('includes/footer');
	}
	/*------------------------------*/
	/*------------------------------*/
        
        public function update_password(){
                $data = array();
                $load = array();
                $sdata = $this->session->userdata('UserData');
                if(!$sdata['id']){
                    redirect('dashboard/signout');    
                }
                $this->load->library('form_validation');
                $this->form_validation->set_rules('current_pass','Current Password','required|trim');
                $this->form_validation->set_rules('new_pass','New Password','required|trim');
                $this->form_validation->set_rules('con_new_pass','Confirm New Password','required|trim|matches[new_pass]');
                if($this->form_validation->run())
                {
                    $JSON = json_encode(array(
                        'userId' => $sdata['id'],
                        'oldPassword' => $this->input->post('current_pass'),
                        'newPassword' => $this->input->post('new_pass'),
                    ));

                    // Update Question API
                    $data['response'] = APICall(API_URL.'api/user/change-password',$JSON); /* call API and get response */     

                    if($data['response']['status'] == 1){
                        $this->session->set_flashdata('msgtype', 'success');                        
                        $this->session->set_flashdata('message', 'Password Updated Successfully !');                        
                        redirect('dashboard');
                    }else{
                       $this->custom_lib->show_response($data['response']);
                    }
                }
		$this->load->view('includes/header',$load);
		$this->load->view('includes/menu');
		$this->load->view('dashboard/update_password',$data);
		$this->load->view('includes/footer');
	}


        public function signout($SessionKey='')  
	{  
		$JSON = json_encode(array(
			"SessionKey" 	=> $SessionKey
		));
		APICall(API_URL.'signin/signout/', $JSON); /* call API and get response */
		$this->session->sess_destroy();
		redirect(base_url(),'refresh');exit();  		
	} 
	



}
