<!DOCTYPE html>
<html ng-app="matriculaOnlineExternaApp" lang="pt-BR" xmlns:otm="http://java.sun.com/jsf/composite/otm">
<head>
<meta charset="iso-8859-1" >
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1">
<!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags -->
<title>Matr&iacute;cula On-line Externa</title>

<!-- Bootstrap -->
<script type="text/javascript" src="js/jquery.min.js"></script>
<link href="css/bootstrap.min.css" rel="stylesheet">
<link rel="stylesheet" href="css/bootstrap-select.min.css">
<link href="css/style.css" rel="stylesheet">
<link rel="stylesheet" href="css/bootstrap-select.css">
<link href='css/loading-bar.css' rel='stylesheet' />
<link href="../resources/css/pdfview.css" rel="stylesheet">
<script type="text/javascript" src="js/bootstrap-select.js"></script>
<script type="text/javascript" src="js/bootstrap.min.js"></script>
<script type="text/javascript" src="js/pdfview/pdf.js"></script>
<script type="text/javascript" library="js/pdfview/pdf.worker.js"></script>
<script type="text/javascript" library="js/qrcode.js"></script>
<script type="text/javascript" src="js/qrcode.min.js"></script>

</head> 
<body>
	  <?php
// recebe dados do curso via site wordpress
// campos são preenchidos no cadastro do curso no painel de gerenciamento do wp
// campos estão hidden na página do curso
 
if(isset($_GET['id']) && isset($_GET['banner'])){
	$idBanner = $_GET['banner'];
	$idCurso = $_GET['id'];
} else {
	$idBanner = null;
	$idCurso = null;
}
?>
  <div ng-init="codigoCurso = <?php echo $idCurso; ?>"></div>
  <div ng-init="codigoBanner = <?php echo $idBanner; ?>"></div>
	<div id="header" class="container cliente-bg">
		<img class="left" alt="SEI" style="width: 220px;" src="image/logo-fdsbc.png"></img>
	</div>
	<div class="container">
		<div class="content">
			<div id="main2" class="right">
				<div id="recadosAluno" class="container box marginbottom padding">
					<div ng-view></div>
			</div>
		</div>
	</div>
	
	
	<script type="text/javascript" src="js/angular.min.js"></script>
	<script type="text/javascript" src="js/angular-route.min.js"></script>
	<script src="js/angular-animate.min.js"></script>
	<script type="text/javascript" src="js/ui-bootstrap-tpls.min.js"></script>
	<script type="text/javascript" src="controller/controller.js?UID=2406031450"></script>
	<script type="text/javascript" src="js/angular-locale_pt-br.js"></script>
	<script type="text/javascript" src="js/loading-bar.js"></script>
	<script type="text/javascript" src="js/jquery.maskMoney.js"></script>	
	<script type="text/javascript" src="js/jquery.alphanumeric.js"></script>
	<script src="js/mask.js"></script>
	<script src="js/script.js?UID=20170918"></script>
</body>
</html>