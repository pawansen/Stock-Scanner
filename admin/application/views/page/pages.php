<div class="panel-body" ng-controller="PageController" ><!-- Body -->

	<!-- Nav tabs -->
	<ul class="nav nav-tabs" style="max-width: 300px; margin: auto;">
		<li class="nav-item">
			<a class="nav-link <?php if(isset($_GET['page']) && $_GET['page']=='about'){echo 'active';}?>" href="page?page=about">About</a>
		</li>
		<li class="nav-item">
			<a class="nav-link <?php if(isset($_GET['page']) && $_GET['page']=='terms'){echo 'active';}?>" href="page?page=terms">Terms</a>
		</li>
		<li class="nav-item">
			<a class="nav-link <?php if(isset($_GET['page']) && $_GET['page']=='privacy'){echo 'active';}?>" href="page?page=privacy">Privacy</a>
		</li>
		<li class="nav-item">
			<a class="nav-link <?php if(isset($_GET['page']) && $_GET['page']=='refund'){echo 'active';}?>" href="page?page=refund">Refund Policy</a>
		</li>
		<li class="nav-item">
			<a class="nav-link <?php if(isset($_GET['page']) && $_GET['page']=='rules'){echo 'active';}?>" href="page?page=rules">Rules & Info</a>
		</li>

		<!-- <li class="nav-item">
			<a class="nav-link <?php // if(isset($_GET['page']) && $_GET['page']=='help'){echo 'active';}?>" href="page?page=help">Help</a>
		</li> -->
	</ul>


<?php if(isset($_GET['page'])){?>
	<div class="form-area" style="max-width:900px; margin: auto; border:1px solid #f7f7f7; padding:10px;">

		<form id="save_form" name="save_form" autocomplete="off" >

			<div class="row">
				<div class="col-md-12">
					<div class="form-group">
						<label class="control-label">Title</label>
						<input type="text" name="Title" class="form-control" value="<?php echo $Data['Title'];?>">
					</div>
				</div>
			</div>

			<div class="row">
				<div class="col-md-12">
					<div class="form-group">
						<label class="control-label">Content</label>
						<textarea id="editor" name="Content" class="form-control" style="min-height:300px"><?php echo $Data['Content'];?></textarea>
					</div>
				</div>
			</div>
		</form>
		<button type="submit" class="btn btn-success btn-sm"  ng-disabled="saveDataLoading" ng-click="saveData('<?php echo $Data['PageGUID'];?>')">Save</button>

	</div>
<?php }else{ ?>
<div class="no-records">Please select the Page.</div>
<?php } ?>





</div><!-- Body/ -->



