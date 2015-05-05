#!/usr/bin/node

var outputDir = '/home/fox/serios/Documentos/Recibos/'

var dalva = new funcionario(
		'Genidalva de Souza dos Santos',
		'688.582.726-68',
		[
			setSalario(1099.87, 'serviço de cuidadora'),
			//setPagamento(200, 'serviço de diarista'),
			setValeTransporte(7*6.20),
			setDesconto(0.08, 'desconto INSS')
		])
    //.pdf(outputDir)
	  .fullReport()

var ana_maria = new funcionario(
		'Ana Maria',
		'780.870.316-87',
		[
			setSalario(1099.87, 'serviço de cuidadora'),
			// diarista 200 + gratificacao 133.50:
			//setPagamento(333.50, 'serviço de diarista'),
			setValeTransporte(6*7.90),
			setDesconto(0.08, 'desconto INSS')
		])
		//.pdf(outputDir)
	  .fullReport()

var margareth = new funcionario(
		'Margareth Maria Martins Rocha de Azevedo',
		'790.771.706-00',
		[
			setSalario(1099.87, 'serviço de cuidadora'),
			setPagamento(200, 'serviço de diarista'),
			setValeTransporte(12*6.20),
			setDesconto(0.08, 'desconto INSS')
		])
		//.pdf(outputDir)
	  //.fullReport()

var lorena = new funcionario(
		'Lorena Letícia Rocha de Azevedo',
		'133.420.066-17',
		[
			setSalario(788.00, 'serviço de auxiliar de escritório'),
			setValeTransporte(9*6.20), // (terça e sexta)
			setDesconto(0.08, 'desconto INSS')
		])
		//.pdf(outputDir)
	  //.fullReport()


/* * * * * FUNCTIONS: * * * * */

// Class Funcionário:
function funcionario(name, cpf, fList) {
	var values = null
  var effects = []
	var _total = 0

	this.name = name
	this.cpf = cpf

	// If the class was built with a list of functions:
	if(fList instanceof Array) {
	  for(var item in fList) {
	  	effects.push(fList[item])
  	}
	  // Update the values according to the effects:
	  apply()
	}

	/* * * * * Public Functions * * * * */

	this.report = function(name) {
		name = this.name || name
		console.log(name?name+' ':'', 'total: ', formatMoney(_total))
		return this;
	}

	this.fullReport = function(name) {
		name = this.name || name
		console.log(name?name+' ':'', 'total: ', formatMoney(_total))
		console.log(values)
		return this;
	}

	this.add = function(effect) {
		effects.push(effect)
		return this;
	}

	this.total = function() {
		return _total
	}

	// Apply all effects to the values list.
	this.apply = apply

	// Create a markdown (.md) document with the receipt.
  this.markdown = markdown

	// Create a pdf document with the receipt.
  this.pdf = pdf

	// Apply all effects over the values list.
	function apply() {
		// Clean the list:
		values = []
		// Apply the effects:
		for(var item in effects) {
			effects[item](values)
		}

		// Update total.
		sumAll()

		return this
	}

	// Make a text in markup language
	// and convert it to a pdf file named: `filename`.
	function markdown(filename, boss) {

		// Update the values.
		this.apply()

		if(filename === undefined)
			filename = this.name.replace(/ /g,'_')

		// If the filename addresses a directory:
		if(filename[filename.length-1]=='/')
			filename = filename + this.name.replace(/ /g,'_') 

		if(boss === undefined)
			boss = 'Clarete Veloso Neves Garcia'
    
		/* * * * * Build markdown text: * * * * */

		var text = [
			'#Recibo\n',
			'Declaro que recebi de ' + boss + ' as importancias abaixo:'
    ].join('\n')

		// New paragraph:
		text += '\n'

		// List the values:
		for(var item in values) {
			item = values[item]
      text += '\n* ' + formatMoney(item.value) + ' referente a ' + item.desc + '.';
		}

		text += '\n\nValor Liquido de ' + formatMoney(_total) + '.';

		// New paragraph:
		text += '\n'

		if(this.name !== undefined)
		  text += [
				"```",
				'\t\t\n',
				'\n\t_______________________________  ',
				'\t\t' + this.name,
				'\t\t' + 'CPF: ' + this.cpf,
				'\t\t\n',
				'\t\t\n',
				'\t\t' + 'Belo Horizonte, ' + currentDate('formated'),
				"```"
			].join('\n')

		/* * * * * End markdown text build * * * * */

		// Write file:
		require('fs').writeFileSync(filename+'.md', text)

		return this;
	}

	function pdf(filename, bossname) {

		if(filename === undefined)
			filename = this.name.replace(/ /g,'_') + '-' + currentDate('iyearmonth')

		// If the filename addresses a directory:
		if(filename[filename.length-1]=='/')
			filename = filename + this.name.replace(/ /g,'_') + '-' + currentDate('iyearmonth')

		var tempfilename = filename.split('/').pop()

		this.markdown('/tmp/'+tempfilename, bossname)

		// Build the pdf file:
		require('child_process').exec(
			'pandoc -f markdown -t latex -o ' + filename+'.pdf' + ' /tmp/'+tempfilename+'.md',
      function(){}
		)

		return this;
	}


	/* * * * * Private Functions * * * * */

	// Sum all the values, and save it on _total.
	function sumAll() {
		_total = 0
		for(var item in values) {
			item = values[item]
      _total += item.value
		}
	}

	function formatMoney(number) {
    if(number < 0)
      return '-R$ ' + -number.toFixed(2)
		else
      return 'R$ ' + number.toFixed(2)
	}

	function currentDate(format) {
		var d = new Date()

		if(format=='formated'){
		  var table = [
			  'Janeiro', 'Fevereiro', 'Março', 'Abril',
			  'Maio', 'Junho', 'Julho', 'Agosto',
			  'Setembro', 'Outubro', 'Novembro', 'Dezembro'
		  ]
		  var date =
			  d.getDate() +' de '+ table[d.getMonth()] +' de '+ d.getFullYear()
		  return date;
	  } else if(format=='inverted') {
		  return d.getFullYear() + '-' + (d.getMonth()+1) + '-' + d.getDate()
	  } else if(format=='iyearmonth') {
		  return d.getFullYear() + '-' + ('0'+(d.getMonth()+1)).slice(-2)
	  } else if(format=='yearmonth') {
		  return ('0'+(d.getMonth()+1)).slice(-2) + '/' + d.getFullYear()
		}
		// Else return normal date:
		return d.getDate() + '/' + (d.getMonth()+1) + '/' + d.getFullYear()
	}
}

function setSalario(sal, desc) {
	return function(values){
		values.push ( { type: 'salary', value: sal, desc: desc } )
	}
}

function setPagamento(pag, desc) {
	return function(values){
		values.push ( { type: 'payment', value: pag, desc: desc } )
	}
}

function setValeTransporte(cost, days) {
	days = days || 1
	return function(values){
		values.push ( { type: 'transport', value: cost*days, desc: 'vale transporte' } )
 	}
}

// O valor esperado é uma porcentagem entre 0 e 1:
function setDesconto(discount, desc) {
	return function(values){
		var value = 0
		for(var item in values) {
			item = values[item]
			if(item.type == 'salary') value -= item.value * discount
		}
		values.push ( { type: 'discount', value: value, desc: desc } )
 	}
}





