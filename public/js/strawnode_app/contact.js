
window.Contact = {
	submit : function(form){
		var $form = $(form) ;
		var $status = $form.siblings('.contact_status') ;
		var $submit = $form.find('.contact_submit') ;
		var $success = $form.siblings('.contact_success') ;
		var tt = window.i18next.t ;

		var $pl_name = $form.find('input[name=name]') ;
		var $pl_email = $form.find('input[name=email]') ;
		var $pl_message = $form.find('input[name=message]') ;

		var sames = arg1 => arg1.prop('value').toLowerCase() == arg1.prop('placeholder').toLowerCase() ;
		
		if(sames($pl_email) || sames($pl_name)) return ;
		if($pl_message.prop('value') == '') return ;

		if($form.find('input[name=website]').val()){
			$form.hide() ;
			$success.html(tt('contact.success')).removeClass('none') ;
			return ;
		}

		$submit.prop('disabled', true).find('.submit_label').text(tt('contact.sending')) ;
		
		$.post('/contact', $form.serialize(), function(res){
			if(res && res.ok){
				$form.hide() ;
				$success.html(tt('contact.success')).removeClass('none') ;
			}else{
				$status.html(tt('contact.invalid')).removeClass('none') ;
				$submit.prop('disabled', false).find('.submit_label').text(tt('contact.submit')) ;
			}
		}).fail(function(xhr){
			var msg = tt('contact.error') ;
			try{
				var res = JSON.parse(xhr.responseText) ;
				if(res && res.error == 'invalid_email') msg = tt('contact.invalid_email') ;
				else if(res && res.error == 'invalid') msg = tt('contact.invalid') ;
			}catch(err){}
			$status.html(msg).removeClass('none') ;
			$submit.prop('disabled', false).find('.submit_label').text(tt('contact.submit')) ;
		}) ;
	}
} ;
