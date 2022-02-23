<?php
defined('BASEPATH') OR exit('No direct script access allowed');
class Question extends CI_Controller {
	
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
                $data['response'] = APICall(API_URL.'api/admin/get-questions'); /* call API and get response */         
		$this->load->view('includes/header',$load);
		$this->load->view('includes/menu');
		$this->load->view('question/question_list',$data);
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
                $this->form_validation->set_rules('question','Question','required');
                $this->form_validation->set_rules('option1','Option 1','required');
                $this->form_validation->set_rules('option2','Option 2','required');
                $this->form_validation->set_rules('correctoption','Correct Option','required');
                if($this->form_validation->run())
                {
                    $JSON = json_encode(array(
                        'question' => $this->input->post('question'),
                        'options' => $this->input->post('option1').','.$this->input->post('option2'),
                        'isRightAnswer' => ($this->input->post('correctoption') == 1)?$this->input->post('option1'):$this->input->post('option2'),
                    ));

                    $data['response'] = APICall(API_URL.'api/admin/add-question',$JSON); /* call API and get response */         
                    if($data['response']['status'] == 1){
                        $this->session->set_flashdata('msgtype', 'success');                        
                        $this->session->set_flashdata('message', 'Question Added Successfully !');                        
                        redirect('question');
                    }else{
                       $this->custom_lib->show_response($data['response']);
                    }                    
                }
		$this->load->view('includes/header',$load);
		$this->load->view('includes/menu');
		$this->load->view('question/add_question',$data);
		$this->load->view('includes/footer');
	}
        
	public function update($id)
	{
                $data = array();
                $load = array();
                // Get Single Question
                $JSON = json_encode(array(
                    'questionId' => $id,
                ));
                $data['response'] = APICall(API_URL.'api/admin/get-question-details',$JSON); /* call API and get response */         
                $data['question'] = $data['response']['data'][0];

                if($data['response']['status'] != 1){
                    redirect('question');    
                }
                $this->load->library('form_validation');
                $this->form_validation->set_rules('question','Question','required');
                $this->form_validation->set_rules('option1','Option 1','required');
                $this->form_validation->set_rules('option2','Option 2','required');
                $this->form_validation->set_rules('correctoption','Correct Option','required');
                if($this->form_validation->run())
                {
                    $JSON = json_encode(array(
                        'questionId' => $id,
                        'question' => $this->input->post('question'),
                        'options' => $this->input->post('option1').','.$this->input->post('option2'),
                        'isRightAnswer' => ($this->input->post('correctoption') == 1)?$this->input->post('option1'):$this->input->post('option2'),
                    ));

                    // Update Question API
                    $data['response'] = APICall(API_URL.'api/admin/update-question',$JSON); /* call API and get response */         
                    if($data['response']['status'] == 1){
                        $this->session->set_flashdata('msgtype', 'success');                        
                        $this->session->set_flashdata('message', 'Question Updated Successfully !');                        
                        redirect('question');
                    }else{
                       $this->custom_lib->show_response($data['response']);
                    }                    
                 }
		$this->load->view('includes/header',$load);
		$this->load->view('includes/menu');
		$this->load->view('question/update_question',$data);
		$this->load->view('includes/footer');
	}

}
