<?php
defined('BASEPATH') OR exit('No direct script access allowed');
class Restaurant extends CI_Controller {
	
	/*------------------------------*/
	/*------------------------------*/	
	public function index()
	{
                $load = array();
//		$load['css']=array(
//			'asset/plugins/chosen/chosen.min.css'
//		);
//		$load['js']=array(
//			'asset/js/question.js',
//			'asset/plugins/chosen/chosen.jquery.min.js',
//			'asset/plugins/jquery.form.js',
//		);	
                $data['response'] = APICall(API_URL.'api/user/get-restaurants'); /* call API and get response */         
		$this->load->view('includes/header',$load);
		$this->load->view('includes/menu');
		$this->load->view('restaurant/restaurant_list',$data);
		$this->load->view('includes/footer');
	}
        
	public function add()
	{
                $data = array();
                $load = array();
//		$load['css']=array(
//			'asset/plugins/chosen/chosen.min.css'
//		);
//		$load['js']=array(
//			'asset/js/question.js',
//			'asset/plugins/chosen/chosen.jquery.min.js',
//			'asset/plugins/jquery.form.js',
//		);	
                $this->load->library('form_validation');
                $this->form_validation->set_rules('name','Name','required');
                $this->form_validation->set_rules('location','Location','required');
                $this->form_validation->set_rules('opentime','Open Time','required');
                $this->form_validation->set_rules('closetime','Close Time','required');
                if($this->form_validation->run())
                {
                    $JSON = json_encode(array(
                        'name' => $this->input->post('name'),
                        'location' => $this->input->post('location'),
                        'openTime' => $this->input->post('opentime'),
                        'closeTime' => $this->input->post('closetime'),
                        'lat' => $this->input->post('lat'),
                        'long' => $this->input->post('long'),
                    ));

                    $data['response'] = APICall(API_URL.'api/user/add-restaurant',$JSON); /* call API and get response */         
                    if($data['response']['status'] == 1){
                        $this->session->set_flashdata('msgtype', 'success');                        
                        $this->session->set_flashdata('message', 'Question Added Successfully !');                        
                        redirect('restaurant');
                    }else{
                       $this->custom_lib->show_response($data['response']);
                    }      

                }
		$this->load->view('includes/header',$load);
		$this->load->view('includes/menu');
		$this->load->view('restaurant/add_restaurant',$data);
		$this->load->view('includes/footer');
	}
        
	public function update($id)
	{
                $data = array();
                $load = array();
                // Get Single Question
                $JSON = json_encode(array(
                    'restaurantId' => $id,
                ));
                $data['response'] = APICall(API_URL.'api/admin/get-restaurant-details',$JSON); /* call API and get response */         
                $data['restaurent'] = $data['response']['data'][0];

                if($data['response']['status'] != 1){
                    redirect('restaurant');    
                }
                
                $this->load->library('form_validation');
                $this->form_validation->set_rules('name','Name','required');
                $this->form_validation->set_rules('location','Location','required');
                $this->form_validation->set_rules('opentime','Open Time','required');
                $this->form_validation->set_rules('closetime','Close Time','required');
                if($this->form_validation->run())
                {
                    $JSON = json_encode(array(
                        'restaurantId' => $id,
                        'name' => $this->input->post('name'),
                        'location' => $this->input->post('location'),
                        'openTime' => $this->input->post('opentime'),
                        'closeTime' => $this->input->post('closetime'),
                        'lat' => $this->input->post('lat'),
                        'long' => $this->input->post('long'),
                    ));

                    // Update Question API
                    $data['response'] = APICall(API_URL.'api/user/update-restauran',$JSON); /* call API and get response */         
                    if($data['response']['status'] == 1){
                        $this->session->set_flashdata('msgtype', 'success');                        
                        $this->session->set_flashdata('message', 'Question Added Successfully !');                        
                        redirect('restaurant');
                    }else{
                       $this->custom_lib->show_response($data['response']);
                    }      

                }
		$this->load->view('includes/header',$load);
		$this->load->view('includes/menu');
		$this->load->view('restaurant/update_restaurant',$data);
		$this->load->view('includes/footer');
	}

}
