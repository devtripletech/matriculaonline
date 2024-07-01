  
function mascaraDecimal(obj, event) {	  
	(function($) {		
		if(event.keyCode == 8 || event.keyCode == 46){
			return true;
		}
		$(obj).maskMoney({prefix:'R$ ', allowNegative: true, thousands:'.', decimal:',', affixesStay: false});	
	}(jQuery));
};

function somenteNumero(obj, event) {	  
	(function($) {		
		if(event.keyCode == 8 || event.keyCode == 46){
			return true;
		}		
		$(obj).numeric();
	}(jQuery));
};

function removerMascara(id) {	  
	(function($) {
		var value = document.getElementById(id).value;
		if(value.indexOf('R$')){
			value = value.replace('R$', '');
		}
	    while(value.indexOf('.') != -1 && value.indexOf(',') != -1 ){
			value = value.replace('.', '');
		}
		if(value.indexOf(',') != -1){
			value = value.replace(',', '.');		
		}
		document.getElementById(id).value = Number(value);		
	}(jQuery));
};

 $('.selectpicker').selectpicker({
          style: 'btn-info',
          size: 4
      });