var preInscricaoModule = angular.module("matriculaOnlineExternaApp", [
  "ui.bootstrap",
  "ngRoute",
  "chieffancypants.loadingBar",
  "ngAnimate",
  "ui.mask",
])

var urlBase = "https://sei.direitosbc.br/webservice/matriculaOnlineExternaRS"
var urlBaseWebServices = "https://sei.direitosbc.br/webservice"

preInscricaoModule.config([
  "$httpProvider",
  "$routeProvider",
  function ($httpProvider, $routeProvider) {
    $routeProvider
      .when("/", {
        templateUrl: "views/cursos.html?uid=20230414",
        controller: "cursoControle",
      })
      .when("/preInscricao", {
        templateUrl: "views/preInscricao.html?uid=20230414",
        controller: "preIncricaoControle",
      })
      .when("/matricula", {
        templateUrl: "views/matricula.html?uid=20230414",
        controller: "matriculaControle",
      })
      .when("/realizarPagamento", {
        templateUrl: "views/realizarPagamento.html?uid=20230414",
        controller: "pagamentoControle",
      })
      .when("/contratoMatriculaExterna", {
        templateUrl: "views/contratoMatriculaExterna.html?uid=20230414",
        controller: "contratoControle",
      })
      .when("/entregaDocumento", {
        templateUrl: "views/entregaDocumento.html?uid=20230414",
        controller: "entregaDocumentoControle",
      })
      .otherwise({
        redirectTo: "/",
      })
  },
])

preInscricaoModule.config(function (cfpLoadingBarProvider) {
  cfpLoadingBarProvider.includeSpinner = true
})

preInscricaoModule.run(function ($rootScope) {
  $rootScope.$on("scope.stored", function (event, data) {
    console.log("scope.stored", data)
  })
})

preInscricaoModule.controller(
  "cursoControle",
  function ($scope, $http, $location, Scopes, $timeout, cfpLoadingBar, $route) {
    Scopes.store("cursoControle", $scope)
    $scope.banners = []
    $scope.myInterval = 3000

    if (
      ($scope.codigoCurso == null || $scope.codigoCurso == 0) &&
      $route.current.params["curso"] != null
    ) {
      $scope.codigoCurso = $route.current.params["curso"]
    }
    if (
      ($scope.codigoBanner == null || $scope.codigoBanner == 0) &&
      $route.current.params["banner"] != null
    ) {
      $scope.codigoBanner = $route.current.params["banner"]
    }

    /**
     *BANNERS
     **/
    if (
      $scope.codigoCurso == null ||
      $scope.codigoCurso == 0 ||
      $scope.codigoBanner == null ||
      $scope.codigoBanner == 0
    ) {
      $http
        .get(urlBase + "/banners")
        .success(function (data) {
          if (data.banner != null) {
            $scope.banners = [].concat(data.banner)
          } else {
            $scope.banners = [].concat(data)
          }
          console.log(data)
        })
        .error(function (error) {
          alert(error.mensagem)
        })
    } else {
      $location.path("/preInscricao")
    }

    /**
     * SLIDER
     **/

    $scope.consultarCurso = function consultarCurso(codigoCurso, codigoBanner) {
      cfpLoadingBar.start()
      $scope.codigoCurso = codigoCurso
      $scope.codigoBanner = codigoBanner
      $location.path("/preInscricao")
      cfpLoadingBar.complete()
    }
  }
)

preInscricaoModule.controller(
  "preIncricaoControle",
  function ($scope, $http, $location, Scopes, $timeout, cfpLoadingBar) {
    Scopes.store("preIncricaoControle", $scope)
    $scope.pessoaObject = {}
    if (
      Scopes.get("cursoControle").codigoCurso == null ||
      Scopes.get("cursoControle").codigoCurso == 0
    ) {
      alert("Curso n\u00e3o selecionado.")
      $location.path("/")
    }
    $http
      .get(
        urlBase + "/consultarCurso/" + Scopes.get("cursoControle").codigoCurso
      )
      .success(function (data) {
        $scope.curso = data
        var dis = [].concat(data.gradeDisciplina.disciplinas)
        $scope.curso.gradeDisciplina.disciplinas = dis
        console.log($scope.curso)
      })
      .error(function (status) {
        console.log(status)
      })
    /**
     *Cadastrar Pré-Inscrição
     **/
    $scope.cadastrarPreInscricao = function cadastrarPreInscricao() {
      if (
        $scope.pessoaObject.nome == null ||
        $scope.pessoaObject.nome.length == 0
      ) {
        alert("O campo NOME deve ser informado!")
        return
      } else if (
        $scope.pessoaObject.email == null ||
        $scope.pessoaObject.email.indexOf("@") == -1 ||
        $scope.pessoaObject.email.indexOf(".") == -1 ||
        $scope.pessoaObject.length == 0
      ) {
        alert("Digite um e-mail v\u00e1lido!")
        return
      } else if (
        $scope.pessoaObject.dataNasc == null ||
        $scope.pessoaObject.length == 0
      ) {
        alert("Digite uma data de nascimento v\u00e1lida!")
        return
      }
      cfpLoadingBar.start()
      var dataStr = $scope.pessoaObject.dataNasc
      var dia = dataStr.substring(0, 2)
      var mes = dataStr.substring(2, 4) - 1
      var ano = dataStr.substring(4, 8)

      $scope.pessoaObject.dataNasc = new Date(ano, mes, dia)

      console.log("cadastrarPreInscricao")
      $scope.pessoaObject.codigoCurso = Scopes.get("cursoControle").codigoCurso
      var parametros = JSON.stringify($scope.pessoaObject)
      console.log(parametros)
      $http
        .post(urlBase + "/cadastrarPreInscricao", parametros, {
          headers: { "Content-Type": "application/json" },
        })
        .success(function (data) {
          $scope.pessoaObject = data
          alert("Pr\u00e9-Inscri\u00e7\u00e3o realizada com Sucesso")
          cfpLoadingBar.complete()
          $location.path("/matricula")
        })
        .error(function (error) {
          console.log(error)
          alert(error.mensagem)
        })
    }

    $scope.voltarTelaInicial = function voltarTelaInicial() {
      $location.path("/")
    }
  }
)

preInscricaoModule.controller(
  "matriculaControle",
  function ($scope, $http, $location, Scopes, $timeout, cfpLoadingBar) {
    if (Scopes.get("preIncricaoControle") == null) {
      $location.path("/")
    }
    if (
      Scopes.get("preIncricaoControle").curso == null ||
      Scopes.get("preIncricaoControle").curso == 0
    ) {
      alert("Curso n\u00e3o selecionado.")
      $location.path("/")
    }
    if (
      Scopes.get("preIncricaoControle").pessoaObject == null ||
      Scopes.get("preIncricaoControle").pessoaObject.nome == null ||
      Scopes.get("preIncricaoControle").pessoaObject.nome.length == 0
    ) {
      alert("Pessoa n\u00e3o localizada.")
      $location.path("/")
    }
    $scope.estados = []
    $scope.cidades = []
    $scope.pessoaObject = Scopes.get("preIncricaoControle").pessoaObject
    cfpLoadingBar.start()
    $scope.loading = true
    converterParaBooleanUtilizarDocumentoEstrangeiro($scope)
    converterParaIntegerEstadoCidade($scope)
    consultarEstado($scope)
    converterParaIntegerCodigoAluno($scope)
    Scopes.store("matriculaControle", $scope)
    console.log($scope.pessoaObject)
    $scope.curso = Scopes.get("preIncricaoControle").curso
    $scope.codigoBanner = Scopes.get("cursoControle").codigoBanner
    $http
      .get(
        urlBase +
          "/V2/consultarDadosParaRealizarMatriculaOnlineExterna/" +
          Scopes.get("cursoControle").codigoCurso +
          "/" +
          Scopes.get("cursoControle").codigoBanner +
          "/" +
          $scope.pessoaObject.codigo
      )
      .success(function (data) {
        $scope.matricula = data
        $scope.matriculaAlunoMatriculado = $scope.matricula.matricula
        cfpLoadingBar.complete()
        console.log($scope.matricula)
        if ($scope.matricula.mensagem != "") {
          console.log($scope.matricula.mensagem)
          alert($scope.matricula.mensagem)
          $scope.loading = false
        } else {
          if (
            $scope.matricula.codigoUnidadeEnsino == undefined ||
            Number.parseInt($scope.matricula.codigoUnidadeEnsino) <= 0
          ) {
            if (
              $scope.matricula.possuiMaisDeUmaUnidadeEnsino == "true" ||
              ($scope.matricula.unidadeEnsinos != undefined &&
                $scope.matricula.unidadeEnsinos[0] != null)
            ) {
              $scope.matricula.codigoUnidadeEnsino =
                $scope.matricula.unidadeEnsinos[0].codigo
            } else if ($scope.matricula.unidadeEnsinos != undefined) {
              $scope.matricula.codigoUnidadeEnsino =
                $scope.matricula.unidadeEnsinos.codigo
            } else {
              $scope.matricula.codigoUnidadeEnsino = 0
            }
          }
          if (
            $scope.matricula.codigoTurno == undefined ||
            Number.parseInt($scope.matricula.codigoTurno) <= 0
          ) {
            if (
              $scope.matricula.possuiMaisDeUmTurno == "true" ||
              ($scope.matricula.turnos != undefined &&
                $scope.matricula.turnos[0] != null)
            ) {
              $scope.matricula.codigoTurno = $scope.matricula.turnos[0].codigo
            } else if ($scope.matricula.turnos != undefined) {
              $scope.matricula.codigoTurno = $scope.matricula.turnos.codigo
            } else {
              $scope.matricula.codigoTurno = 0
            }
          }

          if (
            $scope.matricula.codigoProcessoMatricula == undefined ||
            Number.parseInt($scope.matricula.codigoProcessoMatricula) <= 0
          ) {
            if (
              $scope.matricula.possuiMaisDeUmProcessoMatricula == "true" ||
              ($scope.matricula.processoMatriculas != undefined &&
                $scope.matricula.processoMatriculas[0] != null)
            ) {
              $scope.matricula.codigoProcessoMatricula =
                $scope.matricula.processoMatriculas[0].codigo
            } else if ($scope.matricula.processoMatriculas != undefined) {
              $scope.matricula.codigoProcessoMatricula =
                $scope.matricula.processoMatriculas.codigo
            } else {
              $scope.matricula.codigoProcessoMatricula = 0
            }
          }

          if (
            $scope.matricula.codigoTurma == undefined ||
            Number.parseInt($scope.matricula.codigoTurma) <= 0
          ) {
            if (
              $scope.matricula.possuiMaisDeUmaTurma == "true" ||
              ($scope.matricula.turmas != undefined &&
                $scope.matricula.turmas[0] != null)
            ) {
              $scope.matricula.codigoTurma = $scope.matricula.turmas[0].codigo
            } else if ($scope.matricula.turmas != undefined) {
              $scope.matricula.codigoTurma = $scope.matricula.turmas.codigo
            } else {
              $scope.matricula.codigoTurma = 0
            }
          }

          if (Number.parseInt($scope.matricula.codigoTurma) > 0) {
            $scope.consultandoturma = true
            $scope.atualizarDadosQuandoTurmaAlterado()
          }
          if (
            $scope.matricula.possuiMaisDeUmaCondicaoDePagamento == "true" ||
            ($scope.matricula.condicaoPagamentos != undefined &&
              $scope.matricula.condicaoPagamentos[0] != null)
          ) {
            if (
              $scope.matricula.codigoCondicaoPagamento == undefined ||
              Number.parseInt($scope.matricula.codigoCondicaoPagamento) <= 0
            ) {
              $scope.matricula.codigoCondicaoPagamento =
                $scope.matricula.condicaoPagamentos[0].codigo
            }
            angular.forEach(
              $scope.matricula.condicaoPagamentos,
              function (value, key) {
                if (value.codigo == $scope.matricula.codigoCondicaoPagamento) {
                  $scope.condicaoPagamento = value
                }
              }
            )
          } else {
            if (
              $scope.matricula.condicaoPagamentos != undefined &&
              ($scope.matricula.codigoCondicaoPagamento == undefined ||
                Number.parseInt($scope.matricula.codigoCondicaoPagamento) <= 0)
            ) {
              $scope.matricula.codigoCondicaoPagamento =
                $scope.matricula.condicaoPagamentos.codigo
            }
            $scope.condicaoPagamento = $scope.matricula.condicaoPagamentos
          }
          if ($scope.pessoaObject.cidade.estado.codigo > 0) {
            $scope.consultandocidade = true
            consultarCidade($scope)
          } else if ($scope.estados.length > 0) {
            $scope.pessoaObject.cidade.estado.codigo = $scope.estados[0].codigo
            $scope.consultandocidade = true
            consultarCidade($scope)
          }
        }
        if ($scope.pessoaObject.codigo > 0) {
          $scope.consultandoendereco = true
          consultarEndereco2($scope)
        }
        if (
          !$scope.consultandoendereco &&
          !$scope.consultandoturma &&
          !$scope.consultandocidade
        ) {
          $scope.loading = false
        }
      })
      .error(function (status) {
        cfpLoadingBar.complete()
        $scope.loading = false
        console.log(status)
      })

    $scope.atualizarDadosQuandoTurnoAlterado =
      function atualizarDadosQuandoTurnoAlterado() {
        cfpLoadingBar.start()
        $scope.loading = true
        if (
          $scope.matricula.codigoUnidadeEnsino == undefined ||
          Number.parseInt($scope.matricula.codigoUnidadeEnsino) <= 0
        ) {
          if (
            $scope.matricula.possuiMaisDeUmaUnidadeEnsino == "true" ||
            ($scope.matricula.unidadeEnsinos != undefined &&
              $scope.matricula.unidadeEnsinos[0] != null)
          ) {
            $scope.matricula.codigoUnidadeEnsino =
              $scope.matricula.unidadeEnsinos[0].codigo
          } else if ($scope.matricula.unidadeEnsinos != undefined) {
            $scope.matricula.codigoUnidadeEnsino =
              $scope.matricula.unidadeEnsinos.codigo
          } else {
            $scope.matricula.codigoUnidadeEnsino = 0
          }
        }
        $http
          .get(
            urlBase +
              "/atualizarDadosQuandoTurnoAlterado/" +
              $scope.matricula.codigoUnidadeEnsino +
              "/" +
              $scope.curso.codigo +
              "/" +
              $scope.matricula.codigoTurno +
              "/" +
              $scope.curso.gradeDisciplina.codigo +
              "/" +
              $scope.codigoBanner +
              "/" +
              $scope.pessoaObject.codigo
          )
          .success(function (data) {
            $scope.matricula = data
            if (
              $scope.matricula.possuiMaisDeUmaTurma == "true" ||
              ($scope.matricula.turmas != undefined &&
                $scope.matricula.turmas[0] != null)
            ) {
              $scope.matricula.codigoTurma = $scope.matricula.turmas[0].codigo
            } else if ($scope.matricula.turmas != undefined) {
              $scope.matricula.codigoTurma = $scope.matricula.turmas.codigo
            }

            if (
              $scope.matricula.possuiMaisDeUmaCondicaoDePagamento == "true" ||
              ($scope.matricula.condicaoPagamentos != undefined &&
                $scope.matricula.condicaoPagamentos[0] != null)
            ) {
              $scope.matricula.codigoCondicaoPagamento =
                $scope.matricula.condicaoPagamentos[0].codigo
              angular.forEach(
                $scope.matricula.condicaoPagamentos,
                function (value, key) {
                  if (
                    value.codigo == $scope.matricula.codigoCondicaoPagamento
                  ) {
                    $scope.condicaoPagamento = value
                  }
                }
              )
            } else if ($scope.matricula.condicaoPagamentos != undefined) {
              $scope.matricula.codigoCondicaoPagamento =
                $scope.matricula.condicaoPagamentos.codigo
              $scope.matricula.condicaoPagamentos = $scope.condicaoPagamento
            }

            if (
              $scope.matricula.possuiMaisDeUmProcessoMatricula == "true" ||
              ($scope.matricula.processoMatriculas != undefined &&
                $scope.matricula.processoMatriculas[0] != null)
            ) {
              $scope.matricula.codigoProcessoMatricula =
                $scope.matricula.processoMatriculas[0].codigo
            } else {
              $scope.matricula.codigoProcessoMatricula =
                $scope.matricula.processoMatriculas.codigo
            }

            cfpLoadingBar.complete()
            $scope.loading = false
          })
          .error(function (status) {
            cfpLoadingBar.complete()
            $scope.loading = false
            console.log(status)
          })
      }

    $scope.atualizarDadosQuandoTurmaAlterado =
      function atualizarDadosQuandoTurmaAlterado() {
        cfpLoadingBar.start()
        $scope.loading = true
        $http
          .get(
            urlBase +
              "/V2/atualizarDadosQuandoTurmaAlterado/" +
              $scope.matricula.codigoUnidadeEnsino +
              "/" +
              $scope.curso.codigo +
              "/" +
              $scope.matricula.codigoTurno +
              "/" +
              $scope.curso.gradeDisciplina.codigo +
              "/" +
              $scope.codigoBanner +
              "/" +
              $scope.matricula.codigoTurma +
              "/" +
              $scope.matricula.periodoLetivo.periodoLetivo
          )
          .success(function (data) {
            $scope.matricula = data
            if (
              $scope.matricula.codigoTurno == undefined ||
              Number.parseInt($scope.matricula.codigoTurno) <= 0
            ) {
              if (
                $scope.matricula.possuiMaisDeUmTurno == "true" ||
                ($scope.matricula.turnos != undefined &&
                  $scope.matricula.turnos[0] != null)
              ) {
                $scope.matricula.codigoTurno = $scope.matricula.turnos[0].codigo
              } else if ($scope.matricula.turnos != undefined) {
                $scope.matricula.codigoTurno = $scope.matricula.turnos.codigo
              } else {
                $scope.matricula.codigoTurno = 0
              }
            }

            if (
              $scope.condicaoPagamento == undefined ||
              $scope.condicaoPagamento == null
            ) {
              if (
                $scope.matricula.possuiMaisDeUmaCondicaoDePagamento == "true" ||
                ($scope.matricula.condicaoPagamentos != undefined &&
                  $scope.matricula.condicaoPagamentos[0] != null)
              ) {
                $scope.matricula.codigoCondicaoPagamento =
                  $scope.matricula.condicaoPagamentos[0].codigo
                angular.forEach(
                  $scope.matricula.condicaoPagamentos,
                  function (value, key) {
                    if (
                      value.codigo == $scope.matricula.codigoCondicaoPagamento
                    ) {
                      $scope.condicaoPagamento = value
                    }
                  }
                )
              } else {
                if (
                  $scope.matricula.condicaoPagamentos != undefined &&
                  Number.parseInt($scope.matricula.condicaoPagamentos.codigo) >
                    0
                ) {
                  $scope.matricula.codigoCondicaoPagamento =
                    $scope.matricula.condicaoPagamentos.codigo
                  $scope.matricula.condicaoPagamentos = $scope.condicaoPagamento
                } else {
                  $scope.matricula.codigoCondicaoPagamento = 0
                  $scope.condicaoPagamento = {}
                }
              }
            } else {
              $scope.matricula.codigoCondicaoPagamento =
                $scope.condicaoPagamento.codigo
            }

            if (
              $scope.matricula.possuiMaisDeUmProcessoMatricula == "true" ||
              ($scope.matricula.processoMatriculas != undefined &&
                $scope.matricula.processoMatriculas[0] != null)
            ) {
              $scope.matricula.codigoProcessoMatricula =
                $scope.matricula.processoMatriculas[0].codigo
            } else if ($scope.matricula.processoMatriculas != undefined) {
              $scope.matricula.codigoProcessoMatricula =
                $scope.matricula.processoMatriculas.codigo
            } else {
              $scope.matricula.codigoProcessoMatricula = 0
            }
            $scope.consultandoturma = false
            if (!$scope.consultandocidade && !$scope.consultandoendereco) {
              cfpLoadingBar.complete()
              $scope.loading = false
            }
          })
          .error(function (status) {
            cfpLoadingBar.complete()
            $scope.loading = false
            console.log(status)
          })
      }

    $scope.atualizarDadosQuandoUnidadeEnsinoAlterado =
      function atualizarDadosQuandoUnidadeEnsinoAlterado() {
        cfpLoadingBar.start()
        $scope.loading = true
        $http
          .get(
            urlBase +
              "/atualizarDadosQuandoUnidadeEnsinoAlterado/" +
              Scopes.get("cursoControle").codigoCurso +
              "/" +
              Scopes.get("cursoControle").codigoBanner +
              "/" +
              $scope.pessoaObject.codigo +
              "/" +
              $scope.codigoUnidadeEnsino
          )
          .success(function (data) {
            $scope.matricula = data
            if (
              $scope.matricula.possuiMaisDeUmTurno == "true" ||
              $scope.matricula.turnos[0] != null
            ) {
              $scope.matricula.codigoTurno = $scope.matricula.turnos[0].codigo
            } else {
              $scope.matricula.codigoTurno = $scope.matricula.turnos.codigo
            }
            if (
              $scope.matricula.possuiMaisDeUmProcessoMatricula == "true" ||
              $scope.matricula.processoMatriculas[0] != null
            ) {
              $scope.matricula.codigoProcessoMatricula =
                $scope.matricula.processoMatriculas[0].codigo
            } else {
              $scope.matricula.codigoProcessoMatricula =
                $scope.matricula.processoMatriculas.codigo
            }
            if (
              $scope.matricula.possuiMaisDeUmaTurma == "true" ||
              $scope.matricula.turmas[0] != null
            ) {
              $scope.matricula.codigoTurma = $scope.matricula.turmas[0].codigo
            } else {
              $scope.matricula.codigoTurma = $scope.matricula.turmas.codigo
            }
            if (
              $scope.matricula.possuiMaisDeUmaCondicaoDePagamento == "true" ||
              $scope.matricula.condicaoPagamentos[0] != null
            ) {
              $scope.matricula.codigoCondicaoPagamento =
                $scope.matricula.condicaoPagamentos[0].codigo
              angular.forEach(
                $scope.matricula.condicaoPagamentos,
                function (value, key) {
                  if (
                    value.codigo == $scope.matricula.codigoCondicaoPagamento
                  ) {
                    $scope.condicaoPagamento = value
                  }
                }
              )
            } else {
              $scope.matricula.codigoCondicaoPagamento =
                $scope.matricula.condicaoPagamentos.codigo
              $scope.matricula.condicaoPagamentos = $scope.condicaoPagamento
            }
            cfpLoadingBar.complete()
            $scope.loading = false
          })
          .error(function (status) {
            cfpLoadingBar.complete()
            $scope.loading = false
            console.log(status)
          })
      }

    $scope.consultarCondicaoPagamento = function consultarCondicaoPagamento() {
      console.log($scope.matricula.codigoCondicaoPagamento)
      if (
        $scope.matricula.possuiMaisDeUmaCondicaoDePagamento == "true" ||
        $scope.matricula.condicaoPagamentos[0] != null
      ) {
        angular.forEach(
          $scope.matricula.condicaoPagamentos,
          function (value, key) {
            if (value.codigo == $scope.matricula.codigoCondicaoPagamento) {
              $scope.condicaoPagamento = value
            }
          }
        )
      } else {
        $scope.matricula.condicaoPagamentos = $scope.condicaoPagamento
      }
    }

    function consultarEstado($scope) {
      $http
        .get(urlBaseWebServices + "/estado/pais/brasil")
        .success(function (data) {
          if (data != null) {
            if (data.estado != null && data.estado.length > 0) {
              $scope.estados = [].concat(data.estado)
            } else if (data.length > 0) {
              $scope.estados = [].concat(data)
            }
            $scope.estados = [].concat(data.estado)
            console.log($scope.estados)
          }
        })
        .error(function (status) {
          cfpLoadingBar.complete()
          console.log(status)
        })
    }

    function consultarCidade($scope) {
      cfpLoadingBar.start()
      $scope.loading = true
      $http
        .get(
          urlBaseWebServices +
            "/cidade/estado/" +
            $scope.pessoaObject.cidade.estado.codigo
        )
        .success(function (data) {
          if (data != null) {
            if (data.cidade != null && data.cidade.length > 0) {
              $scope.cidades = [].concat(data.cidade)
            } else if (data.length > 0) {
              $scope.cidades = [].concat(data)
            }
            console.log($scope.cidades)
          }
          $scope.consultandocidade = false
          if (!$scope.consultandoturma && !$scope.consultandoendereco) {
            cfpLoadingBar.complete()
            $scope.loading = false
          }
        })
        .error(function (status) {
          cfpLoadingBar.complete()
          $scope.loading = false
          $scope.consultandocidade = false
          console.log(status)
        })
      converterParaBooleanUtilizarDocumentoEstrangeiro($scope)
    }

    $scope.consultarEndereco = function consultarEndereco() {
      cfpLoadingBar.start()
      $scope.loading = true
      if ($scope.pessoaObject.cep.length > 0) {
        var parametros = JSON.stringify($scope.pessoaObject)
        $http
          .post(urlBase + "/consultarEndereco", parametros, {
            headers: { "Content-Type": "application/json" },
          })
          .success(function (data) {
            $scope.pessoaObject = data
            if ($scope.pessoaObject.cidade.estado.codigo.length > 0) {
              consultarCidade($scope)
              $scope.cidades = {}
              $scope.cidades = [].concat(data.cidade)
              console.log($scope.estados)
            } else {
              cfpLoadingBar.complete()
              $scope.loading = false
              console.log($scope.estados)
            }
          })
          .error(function (status) {
            cfpLoadingBar.complete()
            $scope.loading = false
            console.log(status)
          })
      }
      console.log($scope.pessoaObject.utilizarDocumentoEstrangeiro)
    }

    $scope.realizarMatricula = function realizarMatricula() {
      cfpLoadingBar.start()
      $scope.loading = true
      console.log($scope.matricula.codigoUnidadeEnsino)
      $scope.matricula.matricula = $scope.matriculaAlunoMatriculado
      $scope.matricula.periodoletivo = $scope.matricula.periodoletivo
      $scope.matricula.unidadeEnsino.codigo =
        $scope.matricula.codigoUnidadeEnsino
      $scope.matricula.turno.codigo = $scope.matricula.codigoTurno
      $scope.matricula.processoMatricula.codigo =
        $scope.matricula.codigoProcessoMatricula
      $scope.matricula.turma.codigo = $scope.matricula.codigoTurma
      $scope.matricula.condicaoPagamento.codigo =
        $scope.matricula.codigoCondicaoPagamento
      $scope.matricula.curso.codigo = $scope.pessoaObject.codigoCurso
      $scope.matricula.curso.gradeDisciplina.codigo =
        $scope.curso.gradeDisciplina.codigo
      $scope.matricula.pessoa = $scope.pessoaObject
      $scope.matricula.codigoBanner = $scope.codigoBanner

      if (
        $scope.matricula.pessoa.nome == null ||
        $scope.matricula.pessoa.nome.trim == "" ||
        $scope.matricula.pessoa.nome == 0
      ) {
        alert("O campo NOME deve ser informado!")
        cfpLoadingBar.complete()
        $scope.loading = false
      } else if (
        $scope.matricula.pessoa.email == null ||
        $scope.matricula.pessoa.email.indexOf("@") == -1 ||
        $scope.matricula.pessoa.email.indexOf(".") == -1 ||
        $scope.matricula.pessoa.email == 0
      ) {
        alert("O campo E-MAIL deve ser informado!")
        cfpLoadingBar.complete()
        $scope.loading = false
      } else if (
        ($scope.matricula.pessoa.telefoneResidencial == null ||
          $scope.matricula.pessoa.telefoneResidencial.length == 0 ||
          $scope.matricula.pessoa.telefoneResidencial.trim == "") &&
        ($scope.matricula.pessoa.celular == null ||
          $scope.matricula.pessoa.celular == "" ||
          $scope.matricula.pessoa.celular.length == 0)
      ) {
        alert("Pelo menos 1 campo de TELEFONE deve ser informado!")
        cfpLoadingBar.complete()
        $scope.loading = false
      } else if (
        !$scope.matricula.pessoa.utilizarDocumentoEstrangeiro &&
        ($scope.matricula.pessoa.cpf == null ||
          $scope.matricula.pessoa.cpf == "" ||
          ($scope.matricula.pessoa.cpf.length != 11 &&
            $scope.matricula.pessoa.cpf.length != 14))
      ) {
        alert("O campo CPF deve ser informado!")
        cfpLoadingBar.complete()
        $scope.loading = false
      } else if (
        $scope.matricula.pessoa.cpf != null &&
        $scope.matricula.pessoa.cpf != "" &&
        $scope.matricula.pessoa.cpf.length != 11 &&
        $scope.matricula.pessoa.cpf.length != 14
      ) {
        alert("O CPF deve ser valido!")
        cfpLoadingBar.complete()
        $scope.loading = false
      } else if (
        $scope.matricula.pessoa.utilizarDocumentoEstrangeiro &&
        ($scope.matricula.pessoa.numeroDocumentoEstrangeiro == null ||
          $scope.matricula.pessoa.numeroDocumentoEstrangeiro == "")
      ) {
        alert("O n\u00famero do documento estrangeiro deve ser informado!")
        cfpLoadingBar.complete()
        $scope.loading = false
      } else if (
        $scope.matricula.pessoa.utilizarDocumentoEstrangeiro &&
        ($scope.matricula.pessoa.tipoDocumentoEstrangeiro == null ||
          $scope.matricula.pessoa.tipoDocumentoEstrangeiro == "")
      ) {
        alert("O tipo de documento estrangeiro deve ser informado!")
        cfpLoadingBar.complete()
        $scope.loading = false
      } else if (
        !$scope.matricula.pessoa.utilizarDocumentoEstrangeiro &&
        ($scope.matricula.pessoa.rg == null ||
          $scope.matricula.pessoa.rg.trim == "" ||
          $scope.matricula.pessoa.rg.length == 0)
      ) {
        alert("O campo RG deve ser informado!")
        cfpLoadingBar.complete()
        $scope.loading = false
      } else if (
        $scope.matricula.pessoa.endereco == null ||
        $scope.matricula.pessoa.endereco.trim == "" ||
        $scope.matricula.pessoa.endereco.length == 0
      ) {
        alert("O campo ENDERE\u00c7O deve ser informado!")
        cfpLoadingBar.complete()
        $scope.loading = false
      } else if (
        $scope.matricula.pessoa.numero == null ||
        $scope.matricula.pessoa.numero.trim == "" ||
        $scope.matricula.pessoa.numero.length == 0
      ) {
        alert("O campo N\u00daMERO deve ser informado!")
        cfpLoadingBar.complete()
        $scope.loading = false
      } else {
        var parametros = JSON.stringify($scope.matricula)
        console.log($scope.matricula)
        $http
          .post(urlBase + "/V2/matricularAluno/", parametros, {
            headers: { "Content-Type": "application/json" },
          })
          .success(function (data) {
            $scope.matricula = data
            console.log(data)
            if (
              $scope.matricula.matriculaRealizadaComSucesso == "true" ||
              $scope.matricula.matriculaRealizadaComSucesso == true ||
              data.matriculaRealizadaComSucesso == "true" ||
              data.matriculaRealizadaComSucesso == true
            ) {
              alert(
                "Matr\u00edcula efetuada com sucesso. Segue seu n\u00famero de matr\u00edcula: " +
                  $scope.matricula.matricula
              )
              if (
                $scope.matricula.existeMatriculaPendenteDocumento != null &&
                ($scope.matricula.existeMatriculaPendenteDocumento == "true" ||
                  $scope.matricula.existeMatriculaPendenteDocumento == true)
              ) {
                $location.path("/entregaDocumento")
              } else if (
                $scope.matricula.mensagemErroContrato &&
                $scope.matricula.mensagemErroContrato != "" &&
                $scope.matricula.assinarDigitalmenteContrato == "false" &&
                $scope.matricula.existeMatriculaContaReceberPendente != null &&
                $scope.matricula.existeMatriculaContaReceberPendente == "true"
              ) {
                alert($scope.matricula.mensagemErroContrato)
                $location.path("/realizarPagamento")
              } else if (
                $scope.matricula.assinarDigitalmenteContrato == "true" &&
                $scope.matricula.permiteAssinarContrato == "true" &&
                $scope.matricula.existeContratoPendenteAssinatura == "true"
              ) {
                $location.path("/contratoMatriculaExterna")
              } else {
                $location.path("/realizarPagamento")
              }
            } else {
              alert(
                "Aconteceu um erro inesperado. Efetue sua matr\u00edcula com a institui\u00e7\u00e3o de ensino." +
                  $scope.matricula.mensagem
              )
            }
            cfpLoadingBar.complete()
            $scope.loading = false
          })
          .error(function (status) {
            $scope.loading = false
            cfpLoadingBar.complete()
            console.log(status)
          })
      }
    }

    $scope.carregarDadosPeriodoLetivo = function carregarDadosPeriodoLetivo() {
      cfpLoadingBar.start()
      $scope.loading = true
      $http
        .get(
          urlBase +
            "/carregarDadosPeriodoLetivo/" +
            $scope.matricula.codigoUnidadeEnsino +
            "/" +
            $scope.curso.codigo +
            "/" +
            $scope.matricula.codigoTurno +
            "/" +
            $scope.curso.gradeDisciplina.codigo +
            "/" +
            $scope.codigoBanner +
            "/" +
            $scope.matricula.periodoLetivo.periodoLetivo
        )
        .success(function (data) {
          $scope.matricula = data
          cfpLoadingBar.complete()
          $scope.loading = false

          if (
            $scope.matricula.possuiMaisDeUmaTurma == "true" ||
            ($scope.matricula.turmas != undefined &&
              $scope.matricula.turmas[0] != null)
          ) {
            $scope.matricula.codigoTurma = $scope.matricula.turmas[0].codigo
          } else {
            if ($scope.matricula.turmas != undefined) {
              $scope.matricula.codigoTurma = $scope.matricula.turmas.codigo
            } else {
              $scope.matricula.codigoTurma = 0
            }
          }
          if (
            $scope.matricula.possuiMaisDeUmaCondicaoDePagamento == "true" ||
            ($scope.matricula.condicaoPagamentos != undefined &&
              $scope.matricula.condicaoPagamentos[0] != null)
          ) {
            $scope.matricula.codigoCondicaoPagamento =
              $scope.matricula.condicaoPagamentos[0].codigo
            angular.forEach(
              $scope.matricula.condicaoPagamentos,
              function (value, key) {
                if (value.codigo == $scope.matricula.codigoCondicaoPagamento) {
                  $scope.condicaoPagamento = value
                }
              }
            )
          } else {
            if (
              $scope.matricula.condicaoPagamentos != undefined &&
              Number.parseInt($scope.matricula.condicaoPagamentos.codigo) > 0
            ) {
              $scope.matricula.codigoCondicaoPagamento =
                $scope.matricula.condicaoPagamentos.codigo
              $scope.matricula.condicaoPagamentos = $scope.condicaoPagamento
            } else {
              $scope.matricula.codigoCondicaoPagamento = 0
              $scope.condicaoPagamento = {}
            }
          }
          if (
            $scope.matricula.possuiMaisDeUmProcessoMatricula == "true" ||
            ($scope.matricula.processoMatriculas != undefined &&
              $scope.matricula.processoMatriculas[0] != null)
          ) {
            $scope.matricula.codigoProcessoMatricula =
              $scope.matricula.processoMatriculas[0].codigo
          } else {
            if (
              $scope.matricula.processoMatriculas != undefined &&
              Number.parseInt($scope.matricula.processoMatriculas.codigo) > 0
            ) {
              $scope.matricula.codigoProcessoMatricula =
                $scope.matricula.processoMatriculas.codigo
            } else {
              $scope.matricula.codigoProcessoMatricula = 0
            }
          }
        })
        .error(function (status) {
          cfpLoadingBar.complete()
          $scope.loading = false
          console.log(status)
        })
    }

    function converterParaBooleanUtilizarDocumentoEstrangeiro($scope) {
      if (
        $scope.pessoaObject.utilizarDocumentoEstrangeiro != null &&
        $scope.pessoaObject.utilizarDocumentoEstrangeiro != "" &&
        typeof $scope.pessoaObject.utilizarDocumentoEstrangeiro == "string"
      ) {
        if ($scope.pessoaObject.utilizarDocumentoEstrangeiro == "true") {
          $scope.pessoaObject.utilizarDocumentoEstrangeiro = true
        }
        if ($scope.pessoaObject.utilizarDocumentoEstrangeiro == "false") {
          $scope.pessoaObject.utilizarDocumentoEstrangeiro = false
        }
      }
    }

    function converterParaIntegerEstadoCidade($scope) {
      if (
        $scope.pessoaObject.cidade.estado.codigo != null &&
        $scope.pessoaObject.cidade.estado.codigo != "" &&
        $scope.pessoaObject.cidade.estado.codigo != "0" &&
        typeof $scope.pessoaObject.cidade.estado.codigo == "string"
      ) {
        $scope.pessoaObject.cidade.estado.codigo = parseInt(
          $scope.pessoaObject.cidade.estado.codigo
        )
      }
      if (
        $scope.pessoaObject.cidade.codigo != null &&
        $scope.pessoaObject.cidade.codigo != "" &&
        $scope.pessoaObject.cidade.codigo != "0" &&
        typeof $scope.pessoaObject.cidade.codigo == "string"
      ) {
        $scope.pessoaObject.cidade.codigo = parseInt(
          $scope.pessoaObject.cidade.codigo
        )
      }
    }

    function converterParaIntegerCodigoAluno($scope) {
      if (
        $scope.pessoaObject.codigo != null &&
        $scope.pessoaObject.codigo != "" &&
        $scope.pessoaObject.codigo != "0" &&
        typeof $scope.pessoaObject.codigo == "string"
      ) {
        $scope.pessoaObject.codigo = parseInt($scope.pessoaObject.codigo)
      }
    }

    function consultarEndereco2($scope) {
      cfpLoadingBar.start()
      $scope.loading = true
      if ($scope.pessoaObject.cep.length > 0) {
        var parametros = JSON.stringify($scope.pessoaObject)
        $http
          .post(urlBase + "/consultarEndereco", parametros, {
            headers: { "Content-Type": "application/json" },
          })
          .success(function (data) {
            $scope.pessoaObject = data
            if ($scope.pessoaObject.cidade.estado.codigo.length > 0) {
              consultarCidade($scope)
              $scope.cidades = {}
              $scope.cidades = [].concat(data.cidade)
            }
            $scope.consultandoendereco = false
            if (!$scope.consultandoturma && !$scope.consultandocidade) {
              $scope.loading = false
              cfpLoadingBar.complete()
            }
            console.log($scope.estados)
          })
          .error(function (status) {
            cfpLoadingBar.complete()
            $scope.loading = false
            console.log(status)
          })
      }
    }
  }
)

preInscricaoModule.controller(
  "contratoControle",
  function (
    $scope,
    $http,
    $location,
    Scopes,
    $filter,
    $timeout,
    cfpLoadingBar,
    $sce
  ) {
    if (Scopes.get("matriculaControle") == null) {
      $location.path("/")
    }
    $scope.matricula = Scopes.get("matriculaControle").matricula
    Scopes.store("contratoControle", $scope)
    $scope.matricula.linkDownloadContrato = $sce.trustAsResourceUrl(
      $scope.matricula.linkDownloadContrato
    )

    $scope.registrarAssinaturaContratoPorAluno =
      function registrarAssinaturaContratoPorAluno() {
        var parametros = JSON.stringify($scope.matricula)
        $http
          .post(urlBase + "/registrarAssinaturaContratoPorAluno", parametros, {
            headers: { "Content-Type": "application/json" },
          })
          .success(function (data) {
            $scope.matricula = data
            $location.path("/realizarPagamento")
          })
          .error(function (status) {
            alert(status.mensagem)
            console.log(status)
          })
      }

    $scope.registrarIndeferimentoContratoPorAluno =
      function registrarIndeferimentoContratoPorAluno() {
        $scope.matricula.motivoRecusa = $scope.motivoRecusa
        var parametros = JSON.stringify($scope.matricula)
        $http
          .post(
            urlBase + "/registrarIndeferimentoContratoPorAluno",
            parametros,
            { headers: { "Content-Type": "application/json" } }
          )
          .success(function (data) {
            $scope.matricula = data
            alert(
              "Sua Matr\u00edcula foi criado no nosso sistema, iremos avaliar o motivo da recusa do contrato e em breve daremos o retorno."
            )
            if (
              $scope.matricula.liberadoAvancarPagamentoPorPermissao == "true"
            ) {
              $location.path("/realizarPagamento")
            } else {
              $location.path("/")
            }
          })
          .error(function (status) {
            cfpLoadingBar.complete()
            console.log(status)
          })
      }

    $scope.realizarAvancarEtapaPagamento =
      function realizarAvancarEtapaPagamento() {
        $location.path("/realizarPagamento")
      }
  }
)

preInscricaoModule.controller(
  "pagamentoControle",
  function (
    $scope,
    $http,
    $location,
    Scopes,
    $filter,
    $timeout,
    cfpLoadingBar
  ) {
    if (Scopes.get("matriculaControle") == null) {
      $location.path("/")
    }
    Scopes.store("pagamentoControle", $scope)

    console.log("scope")
    console.log($scope)
    $scope.matricula = Scopes.get("matriculaControle").matricula
    console.log("scope.matricula:" + $scope.matricula)
    $scope.apresentarFormmasPagamento = true
    $scope.apresentarMatriculaconfirmado = false
    $http
      .get(
        urlBase +
          "/V2/consultarContaReceberAlunoNovaMatricula/" +
          $scope.matricula.matricula +
          "/" +
          $scope.matricula.codigoMatriculaPeriodo +
          "/" +
          $scope.matricula.unidadeEnsino.codigo
      )
      .success(function (data) {
        $scope.negociacaoRecebimento = data
        $scope.apresentarOpcaoPagamentoCartao = false
        if ($scope.negociacaoRecebimento.mensagem != "") {
          console.log($scope.negociacaoRecebimento.mensagem)
          alert($scope.negociacaoRecebimento.mensagem)
        } else {
          $scope.montarDadosPagamentoCartaoCredito()
          $scope.inicializarDadosNegociacaoRecebimento()
        }
      })
      .error(function (status) {
        console.log("error")
        console.log(status)
      })

    $scope.adicionarCartaoCredito = function adicionarCartaoCredito(bandeira) {
      cfpLoadingBar.start()
      validarMascaraCampoValorParaPagamento($scope)
      $scope.negociacaoRecebimento.codigoConfiguracaoFinanceiroCartaoAdicionar =
        bandeira
      var parametros = JSON.stringify($scope.negociacaoRecebimento)
      $http
        .post(urlBase + "/adicionarNovoCartaoCredito", parametros, {
          headers: { "Content-Type": "application/json" },
        })
        .success(function (data) {
          $scope.negociacaoRecebimento = data
          console.log($scope.negociacaoRecebimento)
          $scope.inicializarDadosNegociacaoRecebimentoAoAdicionarCartaoCredito()
        })
        .error(function (status) {
          console.log(status)
        })
      cfpLoadingBar.complete()
    }

    $scope.inicializarDadosNegociacaoRecebimentoAoAdicionarCartaoCredito =
      function inicializarDadosNegociacaoRecebimentoAoAdicionarCartaoCredito() {
        cfpLoadingBar.start()
        $scope.negociacaoRecebimento.formaPagamentoMatriculaOnlineExternas =
          [].concat(
            $scope.negociacaoRecebimento.formaPagamentoMatriculaOnlineExternas
          )

        angular.forEach(
          $scope.negociacaoRecebimento.formaPagamentoMatriculaOnlineExternas,
          function (formaPagamento, key) {
            if (formaPagamento.listaItemParcelasDisponiveis != null) {
              formaPagamento.listaItemParcelasDisponiveis = [].concat(
                formaPagamento.listaItemParcelasDisponiveis
              )
            }
            if (
              $scope.negociacaoRecebimento.apresentarMensagemRepasseTaxa ==
                "true" ||
              $scope.negociacaoRecebimento.apresentarMensagemRepasseTaxa == true
            ) {
              formaPagamento.valorRecebimentoCalcularTaxaOperacaoCartao =
                "R$ " +
                formaPagamento.valorRecebimentoCalcularTaxaOperacaoCartao
                  .toString()
                  .replace(".", ",")
            } else {
              formaPagamento.valor =
                "R$ " + formaPagamento.valor.toString().replace(".", ",")
            }

            formaPagamento.valorRecebimentoCalcularTaxaOperacaoCartaoOrgirinal =
              formaPagamento.valorRecebimentoCalcularTaxaOperacaoCartao
            formaPagamento.valorOriginal = formaPagamento.valor
          }
        )
        $scope.inicializarDadosNegociacaoRecebimento()
        cfpLoadingBar.complete()
      }

    $scope.inicializarDadosNegociacaoRecebimento =
      function inicializarDadosNegociacaoRecebimento() {
        cfpLoadingBar.start()
        $scope.apresentarMatriculaconfirmado =
          $scope.negociacaoRecebimento.valorTotalAPagar == null ||
          $scope.negociacaoRecebimento.valorTotalAPagar <= 0.0 ||
          $scope.negociacaoRecebimento.valorTotalAPagar <= "0.0"
        $scope.negociacaoRecebimento.abrirModalVisualizarPix = false
        $scope.negociacaoRecebimento.matriculaRSVO = $scope.matricula
        if (
          $scope.negociacaoRecebimento != null &&
          $scope.negociacaoRecebimento.bandeiraRSVOs != null
        ) {
          console.log($scope.negociacaoRecebimento.bandeiraRSVOs)
          if (
            $scope.negociacaoRecebimento.bandeiraRSVOs.codigo != null ||
            $scope.negociacaoRecebimento.bandeiraRSVOs.codigo == 0
          ) {
            $scope.negociacaoRecebimento.bandeiraRSVOs.bandeiraRSVOs =
              [].concat($scope.negociacaoRecebimento.bandeiraRSVOs)
          }
          $scope.bandeiras = [].concat(
            $scope.negociacaoRecebimento.bandeiraRSVOs
          )
          console.log($scope.bandeiras)
          console.log($scope.negociacaoRecebimento)
        }
        if (
          $scope.negociacaoRecebimento != null &&
          $scope.negociacaoRecebimento.valorTotalAPagar != null &&
          $scope.negociacaoRecebimento.valorTotalAPagar != 0.0 &&
          (($scope.negociacaoRecebimento.apresentarOpcaoBoleto != "true" &&
            $scope.negociacaoRecebimento.apresentarOpcaoPix != "true" &&
            $scope.negociacaoRecebimento.apresentarOpcaocartaoCreditoOnline !=
              "true") ||
            ($scope.negociacaoRecebimento.permiteVisualizarPagamento ==
              "true" &&
              $scope.negociacaoRecebimento.permiteRealizarPagamento != "true"))
        ) {
          $scope.apresentarFormmasPagamento = false
          alert(
            "No momento as opções de pagamento estão indisponíveis, por favor entre em contato com a instituição de ensino para mais informações."
          )
        }
        cfpLoadingBar.complete()
      }

    $scope.inicializarCalcularTotalPago = function inicializarCalcularTotalPago(
      formaPagamento
    ) {
      formaPagamento.editarValorRecebimento = true
      if (
        ($scope.negociacaoRecebimento.apresentarMensagemRepasseTaxa == "true" ||
          $scope.negociacaoRecebimento.apresentarMensagemRepasseTaxa == true) &&
        formaPagamento.valorRecebimentoCalcularTaxaOperacaoCartao !==
          formaPagamento.valorRecebimentoCalcularTaxaOperacaoCartaoOrgirinal
      ) {
        $scope.calcularTotalPago()
      } else if (
        $scope.negociacaoRecebimento.apresentarMensagemRepasseTaxa != "true" &&
        $scope.negociacaoRecebimento.apresentarMensagemRepasseTaxa != true &&
        formaPagamento.valor !== formaPagamento.valorOriginal
      ) {
        $scope.calcularTotalPago()
      }
    }

    $scope.calcularTotalPago = function calcularTotalPago() {
      cfpLoadingBar.start()
      if (
        $scope.negociacaoRecebimento.pagamentoConfirmado != "true" &&
        $scope.negociacaoRecebimento.pagamentoConfirmado != true
      ) {
        validarMascaraCampoValorParaPagamento($scope)
        var parametros = JSON.stringify($scope.negociacaoRecebimento)
        $http
          .post(urlBase + "/calcularTotalPagoCartaoCredito", parametros, {
            headers: { "Content-Type": "application/json" },
          })
          .success(function (data) {
            $scope.negociacaoRecebimento = data
            console.log($scope.negociacaoRecebimento)
            if (
              $scope.negociacaoRecebimento.mensagem != null &&
              $scope.negociacaoRecebimento.mensagem != ""
            ) {
              alert($scope.negociacaoRecebimento.mensagem)
            }
            $scope.inicializarDadosNegociacaoRecebimentoAoAdicionarCartaoCredito()
          })
          .error(function (status) {
            if (
              status.mensagem != null &&
              status.mensagem != undefined &&
              status.mensagem != ""
            ) {
              alert(status.mensagem)
            }
            console.log(status)
          })
      }
      cfpLoadingBar.complete()
    }

    $scope.montarDadosPagamentoCartaoCredito = function () {
      $scope.meses = [
        { id: "01", nome: "Janeiro" },
        { id: "02", nome: "Fevereiro" },
        { id: "03", nome: "Mar\u00e7o" },
        { id: "04", nome: "Abril" },
        { id: "05", nome: "Maio" },
        { id: "06", nome: "Junho" },
        { id: "07", nome: "Julho" },
        { id: "08", nome: "Agosto" },
        { id: "09", nome: "Setembro" },
        { id: "10", nome: "Outubro" },
        { id: "11", nome: "Novembro" },
        { id: "12", nome: "Dezembro" },
      ]

      $scope.anos = []

      var date = new Date()

      var ano = Number($filter("date")(date, "yyyy"))

      for (var i = 0; i < 10; i++) {
        $scope.anos.push(ano)
        ano = ano + 1
      }
    }

    $scope.removerCartaoCredito = function removerCartaoCredito(index) {
      $scope.negociacaoRecebimento.formaPagamentoMatriculaOnlineExternas.splice(
        index,
        1
      )
    }

    $scope.removerCartaoCreditoFormaPagamento =
      function removerCartaoCreditoFormaPagamento(formaPagamento) {
        $scope.negociacaoRecebimento.valorTotalRecebimento =
          $scope.negociacaoRecebimento.valorTotalRecebimento
            .valorTotalRecebimento - formaPagamento.valor
        $scope.negociacaoRecebimento.formaPagamentoMatriculaOnlineExternas =
          $scope.negociacaoRecebimento.formaPagamentoMatriculaOnlineExternas.filter(
            (forma) => forma.ordem !== formaPagamento.ordem
          )
        if (
          $scope.negociacaoRecebimento.formaPagamentoMatriculaOnlineExternas !=
            null &&
          Array.isArray(
            $scope.negociacaoRecebimento.formaPagamentoMatriculaOnlineExternas
          ) &&
          $scope.negociacaoRecebimento.formaPagamentoMatriculaOnlineExternas
            .length != null &&
          $scope.negociacaoRecebimento.formaPagamentoMatriculaOnlineExternas
            .length > 0
        ) {
          $scope.calcularTotalPago()
        }
      }

    $scope.realizarPagamentoCartaoCredito =
      function realizarPagamentoCartaoCredito() {
        cfpLoadingBar.start()
        $scope.negociacaoRecebimento.matricula = $scope.matricula.matricula
        $scope.negociacaoRecebimento.codigoMatriculaPeriodo =
          $scope.matricula.codigoMatriculaPeriodo
        $scope.negociacaoRecebimento.codigoUnidadeEnsino =
          $scope.matricula.unidadeEnsino.codigo

        var alerta = false
        angular.forEach(
          $scope.negociacaoRecebimento.formaPagamentoMatriculaOnlineExternas,
          function (value, key) {
            if (
              value.codigoConfiguracaoFinanceiroCartao == null ||
              value.codigoConfiguracaoFinanceiroCartao == 0
            ) {
              alerta = true
              alert("O campo BANDEIRA deve ser informado!")
              return
            } else if (
              ($scope.negociacaoRecebimento.apresentarMensagemRepasseTaxa !=
                null &&
                ($scope.negociacaoRecebimento.apresentarMensagemRepasseTaxa ==
                  "true" ||
                  $scope.negociacaoRecebimento.apresentarMensagemRepasseTaxa ==
                    true) &&
                value.valorRecebimentoCalcularTaxaOperacaoCartao == null) ||
              value.valorRecebimentoCalcularTaxaOperacaoCartao.length == 0 ||
              value.valorRecebimentoCalcularTaxaOperacaoCartao == "R$ 0,00"
            ) {
              alerta = true
              alert("O campo VALOR deve ser informado!")
              return
            } else if (
              ($scope.negociacaoRecebimento.apresentarMensagemRepasseTaxa ==
                null ||
                ($scope.negociacaoRecebimento.apresentarMensagemRepasseTaxa !=
                  "true" &&
                  $scope.negociacaoRecebimento.apresentarMensagemRepasseTaxa !=
                    true)) &&
              (value.valor == null ||
                value.valor.length == 0 ||
                value.valor == "R$ 0,00")
            ) {
              alerta = true
              alert("O campo VALOR deve ser informado!")
              return
            } else if (
              value.numeroCartao == null ||
              value.numeroCartao.length == 0
            ) {
              alerta = true
              alert("O campo N\u00daMERO CART\u00c3O deve ser informado!")
              return
            } else if (
              value.nomeNoCartao == null ||
              value.nomeNoCartao.length == 0
            ) {
              alerta = true
              alert("O campo NOME DO CART\u00c3O deve ser informado!")
              return
            } else if (
              value.mesValidade == null ||
              value.mesValidade.length == 0
            ) {
              alerta = true
              alert("O campo M\u00caS VALIDADE deve ser informado!")
              return
            } else if (
              value.anoValidade == null ||
              value.anoValidade.length == 0
            ) {
              alerta = true
              alert("O campo ANO VALIDADE deve ser informado!")
              return
            } else if (
              value.codigoDeVerificacao == null ||
              value.codigoDeVerificacao.length == 0
            ) {
              alerta = true
              alert(
                "O campo N\u00daMERO DE VERIFICA\u00c7\u00c3O DO CART\u00c3O (CVV) deve ser informado!"
              )
              return
            } else {
              validarMascaraCampoValorParaPagamento($scope)
            }
          }
        )
        if (alerta == false) {
          console.log(
            $scope.negociacaoRecebimento.formaPagamentoMatriculaOnlineExternas
          )
          var parametros = JSON.stringify($scope.negociacaoRecebimento)
          $http
            .post(urlBase + "/realizarPagamentoCartaoCredito", parametros, {
              headers: { "Content-Type": "application/json" },
            })
            .success(function (data) {
              var negociacaoAxu = data
              console.log(negociacaoAxu)
              if (
                negociacaoAxu.pagamentoConfirmado == "true" ||
                negociacaoAxu.pagamentoConfirmado == true ||
                data.pagamentoConfirmado == true ||
                data.pagamentoConfirmado == "true"
              ) {
                alert("Pagamento confirmado.")
                $scope.negociacaoRecebimento = data
                window.open(
                  $scope.negociacaoRecebimento.linkDownloadComprovantePagamento
                )
                $scope.apresentarMatriculaconfirmado = true
              } else {
                alert(
                  "Pagamento pendente, entre em contato com a Institui\u00e7\u00e3o de Ensino." +
                    negociacaoAxu.mensagem
                )
              }
            })
            .error(function (status) {
              console.log(status)
            })
        }
        cfpLoadingBar.complete()
      }

    $scope.realizarImpressaoBoleto = function realizarImpressaoBoleto() {
      cfpLoadingBar.start()
      $scope.apresentarOpcaoPagamentoCartao = false
      $scope.negociacaoRecebimento.formaPagamentoMatriculaOnlineExternas = []
      var parametros = JSON.stringify($scope.negociacaoRecebimento)
      $http
        .post(urlBase + "/realizarImpressaoBoletoBancario", parametros, {
          headers: { "Content-Type": "application/json" },
        })
        .success(function (data) {
          $scope.negociacaoRecebimento = data
          $scope.apresentarMatriculaconfirmado = true
          window.open($scope.negociacaoRecebimento.linkDownloadBoleto)
          console.log($scope.negociacaoRecebimento)
        })
        .error(function (status) {
          $scope.apresentarMatriculaconfirmado = true
          console.log(status)
        })
      cfpLoadingBar.complete()
    }

    $scope.realizarVisualizacaoCartaoCredito =
      function realizarVisualizacaoCartaoCredito() {
        cfpLoadingBar.start()
        $scope.apresentarOpcaoPagamentoCartao = true
        $scope.apresentarMatriculaconfirmado = false
        cfpLoadingBar.complete()
      }

    $scope.realizarVisualizacaoPix = function realizarVisualizacaoPix() {
      cfpLoadingBar.start()
      $scope.apresentarOpcaoPagamentoCartao = false
      $scope.negociacaoRecebimento.formaPagamentoMatriculaOnlineExternas = []
      $scope.apresentarQrCode = false
      $scope.modalPixCarregado = false
      $http
        .get(
          urlBase +
            "/realizarGeracaoPixContaCorrente/" +
            $scope.matricula.matricula +
            "/" +
            $scope.matricula.unidadeEnsino.codigo +
            "/" +
            $scope.negociacaoRecebimento.contaReceber.codigo
        )
        .success(function (data) {
          $scope.pix = data
          $scope.apresentarMatriculaconfirmado = true
          console.log($scope.pix)
          if ($scope.pix != null && $scope.pix.qrCode != null) {
            $scope.modalPixCarregado = true
            $("#orientacaoPix").empty()
            $("#orientacaoPix").append($scope.pix.orientacaoPix)
            $scope.openModalPix()
          }
        })
        .error(function (status) {
          cfpLoadingBar.complete()
          $scope.apresentarMatriculaconfirmado = true
          if (status != undefined && status.mensagem != undefined) {
            alert(status.mensagem)
          } else {
            alert("Não foi possível a geração do Pix.")
          }
          console.log(status)
        })
    }

    $scope.montarQrCode = function montarQrCode() {
      $scope.apresentarQrCode = true
      new QRCode(document.getElementById("panelQrCode"), {
        text: $scope.pix.qrCode,
        width: 250,
        height: 250,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H,
      })
    }

    $scope.openModalPix = function () {
      var modal = angular.element("#modalVisualizarPix")
      modal.modal("show")
    }
    $scope.closeModalPix = function () {
      var modal = angular.element("#modalVisualizarPix")
      modal.modal("hide")
    }

    $scope.concluirMatricula = function concluirMatricula() {
      $location.path("/")
    }

    function validarMascaraCampoValorParaPagamento($scope) {
      angular.forEach(
        $scope.negociacaoRecebimento.formaPagamentoMatriculaOnlineExternas,
        function (formaPagamento, key) {
          var valorRecebimentoCalcularTaxaOperacaoCartao =
            formaPagamento.valorRecebimentoCalcularTaxaOperacaoCartao
          if (valorRecebimentoCalcularTaxaOperacaoCartao.indexOf != undefined) {
            if (
              valorRecebimentoCalcularTaxaOperacaoCartao.indexOf("R$") != -1
            ) {
              valorRecebimentoCalcularTaxaOperacaoCartao =
                valorRecebimentoCalcularTaxaOperacaoCartao.replace("R$", "")
            }
            while (
              valorRecebimentoCalcularTaxaOperacaoCartao.indexOf(".") != -1
            ) {
              valorRecebimentoCalcularTaxaOperacaoCartao =
                valorRecebimentoCalcularTaxaOperacaoCartao.replace(".", "")
            }
            if (valorRecebimentoCalcularTaxaOperacaoCartao.indexOf(" ")) {
              valorRecebimentoCalcularTaxaOperacaoCartao =
                valorRecebimentoCalcularTaxaOperacaoCartao.replace(" ", "")
            }
            if (valorRecebimentoCalcularTaxaOperacaoCartao.indexOf(",") != -1) {
              valorRecebimentoCalcularTaxaOperacaoCartao =
                valorRecebimentoCalcularTaxaOperacaoCartao.replace(",", ".")
            }
          }
          if (valorRecebimentoCalcularTaxaOperacaoCartao != "") {
            formaPagamento.valorRecebimentoCalcularTaxaOperacaoCartao = Number(
              valorRecebimentoCalcularTaxaOperacaoCartao
            )
          } else {
            formaPagamento.valorRecebimentoCalcularTaxaOperacaoCartao =
              Number(0.0)
          }
          var valor = formaPagamento.valor
          if (valor.indexOf != undefined) {
            if (valor.indexOf("R$") != -1) {
              valor = valor.replace("R$", "")
            }
            while (valor.indexOf(".") != -1 && valor.indexOf(",") != -1) {
              valor = valor.replace(".", "")
            }
            if (valor.indexOf(" ")) {
              valor = valor.replace(" ", "")
            }
            if (valor.indexOf(",") != -1) {
              valor = valor.replace(",", ".")
            }
          }
          if (valor != "") {
            formaPagamento.valor = Number(valor)
          } else {
            formaPagamento.valor = Number(0.0)
          }
        }
      )
    }
  }
)

preInscricaoModule.controller(
  "entregaDocumentoControle",
  function ($scope, $http, $location, Scopes, $timeout, cfpLoadingBar) {
    if (Scopes.get("matriculaControle") == null) {
      $location.path("/")
    }
    Scopes.store("entregaDocumentoControle", $scope)
    $scope.matricula = Scopes.get("matriculaControle").matricula
    console.log($scope.matricula)
    $scope.initEntregaDocumentos = function initEntregaDocumentos() {
      if ($scope.matricula.documentacaoMatriculaVOs != null) {
        var docs = [].concat($scope.matricula.documentacaoMatriculaVOs)
        $scope.matricula.documentacaoMatriculaVOs = docs
      } else {
        $scope.consultarEntregaDocumentos()
      }
      angular.forEach(
        $scope.matricula.documentacaoMatriculaVOs,
        function (value, key) {
          if (value.entregue == undefined) {
            value.entregue = value.isEntregue
          }
        }
      )
    }

    $scope.consultarEntregaDocumentos = function consultarEntregaDocumentos() {
      cfpLoadingBar.start()
      $scope.loading = true
      $http
        .get(
          urlBase + "/consultarEntregaDocumentos/" + $scope.matricula.matricula
        )
        .success(function (data) {
          $scope.matricula.documentacaoMatriculaVOs = data
          cfpLoadingBar.complete()
          $scope.loading = false

          if ($scope.matricula.documentacaoMatriculaVOs != null) {
            var docs = [].concat($scope.matricula.documentacaoMatriculaVOs)
            $scope.matricula.documentacaoMatriculaVOs = docs
          } else {
            $scope.matricula.documentacaoMatriculaVOs = []
          }
        })
        .error(function (status) {
          cfpLoadingBar.complete()
          $scope.loading = false
          console.log(status)
        })
    }

    // metodo responsavel por setar o documento no scopo no momento de realizar o upload
    // acionado pelo evento de click no input  file do html
    $scope.setDocumento = function setDocumento(documentacaoMatricula) {
      cfpLoadingBar.start()
      $scope.documento = documentacaoMatricula
      cfpLoadingBar.complete()
    }

    // metodo responsvel por realizar upload do arquivo de documento
    // acionado pelo evento de onchanged no input  file do html
    // este metodo retorna o objeto
    $scope.uploadDocumento = function uploadDocumento(element, frente) {
      var headers = {
        objeto: $scope.documento.codigo,
        frente: frente,
        "Content-Type": undefined,
      }
      var fd = new FormData()
      fd.append("documento", element.files[0])
      $http
        .post(urlBase + "/realizarUploadArquivoDocumentoMatricula", fd, {
          headers,
        })
        .success(function (data) {
          var documentoData = data
          $scope.adicionarDocumentoAtualizadoALista(documentoData, frente)
          if (
            $scope.documento.tipoDeDocumentoVO.documentoFrenteVerso == "true" &&
            frente
          ) {
            abrirModalDocumentoVerso()
          } else {
            if (
              $scope.documento.tipoDeDocumentoVO.documentoFrenteVerso == "true"
            ) {
              fecharModalDocumentoVerso()
            }
            $scope.gravarDocumentacaoMatricula()
          }
          cfpLoadingBar.complete()
        })
        .error(function (status) {
          cfpLoadingBar.complete()
          if (
            $scope.documento.tipoDeDocumentoVO.documentoFrenteVerso == "true" &&
            !frente
          ) {
            alert(
              "O Arquivo Verso n\u00e3o possui a mesma extens\u00e3o do Arquivo Frente"
            )
          }
          console.log(status)
        })
    }

    // metodo responsavel por realizar a gravação da documentacao matricula
    // este metodo retorna o objeto DocumentacaoMatriculaRSVO  persistido
    $scope.gravarDocumentacaoMatricula =
      function gravarDocumentacaoMatricula() {
        cfpLoadingBar.start()
        var parametros = JSON.stringify($scope.documento)
        $http
          .post(urlBase + "/gravarDocumentacaoMatricula", parametros, {
            headers: { "Content-Type": "application/json" },
          })
          .success(function (data) {
            var documentoData = data
            if (documentoData.entregue == undefined) {
              documentoData.entregue = documentoData.isEntregue
            }
            for (
              let index = 0;
              index < $scope.matricula.documentacaoMatriculaVOs.length;
              index++
            ) {
              let element = $scope.matricula.documentacaoMatriculaVOs[index]
              if (element.codigo == documentoData.codigo) {
                $scope.matricula.documentacaoMatriculaVOs[index] = documentoData
                break
              }
            }
            alert("Gravado com Sucesso.")
          })
          .error(function (status) {
            cfpLoadingBar.complete()
            console.log(status)
          })
        cfpLoadingBar.complete()
      }

    $scope.adicionarDocumentoAtualizadoALista =
      function adicionarDocumentoAtualizadoALista(documentoData, frente) {
        cfpLoadingBar.start()
        angular.forEach(
          $scope.matricula.documentacaoMatriculaVOs,
          function (documentoParam, key) {
            if (documentoData.codigo == documentoParam.codigo) {
              var arquivoFrente = {}
              arquivoFrente = $scope.documento.arquivoVO
              $scope.documento = documentoData
              if (documentoData.entregue == undefined) {
                documentoData.entregue = documentoData.isEntregue
              }
              if (!frente) {
                $scope.documento.arquivoVO = arquivoFrente
              }
              $scope.matricula.documentacaoMatriculaVOs.splice(key, 1)
              $scope.matricula.documentacaoMatriculaVOs.splice(
                key,
                0,
                documentoData
              )
            }
          }
        )
        cfpLoadingBar.complete()
      }

    function abrirModalDocumentoVerso() {
      $timeout(function () {
        angular.element("#btnAbrirModalEtregaVersoDocumento").trigger("click")
      })
    }
    function fecharModalDocumentoVerso() {
      $timeout(function () {
        angular.element("#btnFecharModalEtregaVersoDocumento").trigger("click")
      })
    }

    $scope.realizarAvancarContratoMatricula =
      function realizarAvancarContratoMatricula() {
        if ($scope.validarListaDocumentacaoMatricula()) {
          if (
            $scope.matricula.permiteAssinarContrato == "false" &&
            $scope.matricula.assinarDigitalmenteContrato == "true" &&
            $scope.matricula.existeMatriculaContaReceberPendente == "true" &&
            $scope.matricula.liberadoAvancarPagamentoPorPermissao == "true"
          ) {
            if (
              $scope.matricula.mensagemErroContrato &&
              $scope.matricula.mensagemErroContrato != ""
            ) {
              alert($scope.matricula.mensagemErroContrato)
            }

            $location.path("/realizarPagamento")
          } else if (
            $scope.matricula.assinarDigitalmenteContrato == "true" &&
            $scope.matricula.permiteAssinarContrato == "true" &&
            $scope.matricula.provedorAssinaturaSeiUtilizar == "true" &&
            $scope.matricula.existeContratoPendenteAssinatura == "true"
          ) {
            $location.path("/contratoMatriculaExterna")
          } else if (
            $scope.matricula.assinarDigitalmenteContrato == "true" &&
            $scope.matricula.permiteAssinarContrato == "true" &&
            $scope.matricula.provedorAssinaturaCertiSignUtilizar == "true" &&
            $scope.matricula.existeContratoPendenteAssinatura == "true"
          ) {
            var win = window.open(
              $scope.matricula.linkDownloadContrato,
              "portaldeassinaturas",
              "left=0, top=0, width=" +
                (930 - 10) +
                ", height=" +
                (595 - 110) +
                ", dependent=yes, maximize=yes, fullscreen=yes, scrollbars=yes, focus=yes"
            )
            win.focus()
            $location.path("/realizarPagamento")
          } else {
            $location.path("/realizarPagamento")
          }
        }
      }

    $scope.validarListaDocumentacaoMatricula =
      function validarListaDocumentacaoMatricula() {
        for (let documento of $scope.matricula.documentacaoMatriculaVOs) {
          // por algum cenario onde o servidor externo
          // traz a informaçao  entregue  como isEntregue .
          // foi validado as inicializaçoes do campo no webservice
          // porem este cenario ainda acontece
          // entao este if serve para pegar a informaçao
          // criada como isEntregue e referenciar a entregue
          if (documento.entregue == undefined) {
            documento.entregue = documento.isEntregue
          }

          // este if valida se existe algum documento obrigatorio pendente de realizar upload
          // caso exista o sistema nao podera avançar pois existe documento obrigatorio a ser anexado
          //necessario validar  se documento foi entregue pois  quando documento e entregue e gerado novo arquivoVO assinado ou
          // somente documento sera colocado como entregue e estes mesmo nao necessitara passar pela validaçao de ausencia
          // de upload
          if (
            documento.entregue == "false" &&
            documento.tipoDeDocumentoVO.permitirPostagemPortalAluno == "true" &&
            ((documento.gerarSuspensaoMatricula == "true" &&
              (documento.arquivoVO.codigo == "0" ||
                (documento.arquivoVO.codigo != "0" &&
                  documento.tipoDeDocumentoVO.documentoFrenteVerso == "true" &&
                  documento.arquivoVOVerso.codigo == "0"))) ||
              (documento.gerarSuspensaoMatricula == "false" &&
                documento.tipoDeDocumentoVO.documentoFrenteVerso == "true" &&
                documento.arquivoVO.nome != null &&
                documento.arquivoVO.nome != undefined &&
                documento.arquivoVO.nome != "" &&
                documento.arquivoVOVerso.codigo == "0"))
          ) {
            existeDocumentoObrigatorioNaoEntregue = true
            let frenteverso = ""
            this.loading = false
            if (!documento.tipoDeDocumentoVO.documentoFrenteVerso == "true") {
              frenteverso =
                "&eacute Frente e verso , realizar o upload do documento frente e verso &eacute  "
            }
            alert(
              "O documento " +
                documento.tipoDeDocumentoVO.nome +
                " " +
                frenteverso +
                "Obrigatorios.",
              "Alerta"
            )
            $("html, body").animate(
              {
                scrollTop:
                  $(
                    "#div-tab-conteudo-lista-borda-sublinhada" +
                      documento.codigo
                  ).offset().top - 100,
              },
              "slow"
            )
            return false
          }
        }
        return true
      }
  }
)

preInscricaoModule.factory("Scopes", function ($rootScope) {
  var mem = {}

  return {
    store: function (key, value) {
      $rootScope.$emit("scope.stored", key)
      mem[key] = value
    },
    get: function (key) {
      return mem[key]
    },
  }
})
