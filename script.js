document.addEventListener('DOMContentLoaded', _ => {
  const richestAddresses = ['Ae2tdPwUPEYzMC5oxgTjyBBwQnAmxogW9p16JtUAK9ymgz9vZR4d8RJUTQ9',
'DdzFFzCqrht2WKNEFqHvMSumSQpcnMxcYLNNBXPYXyHpRk9M7PqVjZ5ysYzutnruNubzXak2NxT8UWTFQNzc77uzjQ1GtehBRBdAv7xb',
'Ae2tdPwUPEYzBujXrRvfNGsab8mdpGRzm4kQiioQ4F1QzdqYzp755rpGiqt',
'DdzFFzCqrhstmqBkaU98vdHu6PdqjqotmgudToWYEeRmQKDrn4cAgGv9EZKtu1DevLrMA1pdVazufUCK4zhFkUcQZ5Gm88mVHnrwmXvT',
'DdzFFzCqrhsgwQmeWNBTsG8VjYunBLK9GNR93GSLTGj1FeMm8kFoby2cTHxEHBEraHQXmgTtFGz7fThjDRNNvwzcaw6fQdkYySBneRas',
'DdzFFzCqrhsnpuVPsBcNPetBV4HBA3LhVYHBwfPrAHd15usnJrT9Aoii2y5NPD3Vzni3tMiUchDY2pZz3J9Jae7xZUVHwDjpWWFibLs5',
'DdzFFzCqrhswYBdxQvKFKjkqk9d6MPWhJ1QT7Xm93paQrdbCPLBL5JaPGfCRE4BdWgH5ivn7Sstfrp11DJinP7yFC3bLTHDh2SWhHPZ4'
]
  document.querySelector('datalist').innerHTML = richestAddresses.map(v => `<option value="${v}" />`).join('')
  document.querySelector('#the_form').addEventListener('submit', event => {
    event.preventDefault()
    if(document.querySelector('#address').value.trim() != '') {
      showBalanceInfo(event)
    }else{
      document.querySelector('h3').style.display = 'block'
      document.querySelector('h3').innerHTML = 'Provide an address'
    }
  })
  async function showBalanceInfo(e) {
    console.clear()
    let json = null
    try {
      const generalInfo = document.querySelector('#generalInfo')
      generalInfo.innerHTML = ''
      const tBody = document.querySelector('tbody')
      document.querySelector('table').style.display = 'none'
      tBody.innerHTML = ''
      document.querySelector('button').style.visibility = 'hidden'
      document.querySelector('h2').innerHTML = 'Fetching cardanoexplorer API thru a public proxy CORS server...'
      //const proxyCORS = 'https://cors-anywhere.herokuapp.com/'
      const proxyCORS = 'https://wt-artgreg-outlook-fr-0.sandbox.auth0-extend.com/ada-explorer'
      const inceptionAddress = document.querySelector('#address').value.trim()
      document.querySelector('h3').innerHTML = ''
      const response = await fetch(`${proxyCORS}?address=${inceptionAddress}`)
      json = await response.json()
      console.log(json)
      const mainAddressBalance = +json.Right.caBalance.getCoin
      const formatADA = {  minimumFractionDigits: 0 }
      const adaSVG = '<img src="ada-big.png" width="15px">'
      const output = json.Right.caTxList.reduce((acc, curr, k) => { // where v = { ctbID: 'wef' etc}
      const temp = curr.ctbOutputs.find(v2 => v2[0] === inceptionAddress)
      if(!temp){
        console.log('no inceptionAddress in this cboutputs '+k)
        console.log('but you can check if there is a new generated wallet address below ')
        const balanceNewWalletAddress = +curr.ctbOutputs[0][1].getCoin
        const externalSentTransactionAmount = +curr.ctbOutputs[1][1].getCoin
        const shortNewWalletAddress= `${curr.ctbOutputs[0][0].substr(0, 12)}...${curr.ctbOutputs[0][0].substr(curr.ctbOutputs[0][0].length - 12)}`
        const shortDestTransactionAddress= `${curr.ctbOutputs[1][0].substr(0, 12)}...${curr.ctbOutputs[1][0].substr(curr.ctbOutputs[1][0].length - 12)}`
        tBody.innerHTML += `<tr><td>${new Date(curr.ctbTimeIssued*1e3).toUTCString()}</td>
        <td><a href="#" style="color: green;" onclick="document.querySelector('#address').value = '${curr.ctbOutputs[0][0]}'">${shortNewWalletAddress}</a></td>
        <td><b>${balanceNewWalletAddress.toLocaleString('de-DE', formatADA)}</b> ${adaSVG}</td>
        <td><b>${externalSentTransactionAmount.toLocaleString('de-DE', formatADA)}</b> ${adaSVG}</td>
        <td><a href="#" style="color: red;" onclick="document.querySelector('#address').value = '${curr.ctbOutputs[1][0]}'">${shortDestTransactionAddress}</a></td></tr>`
        console.log('current value =>',curr)
        // at first iteration acc.totalFromGeneratedWalletAddresses is expected to be undefined!
        const totalFromGeneratedWalletAddresses = acc.totalFromGeneratedWalletAddresses + balanceNewWalletAddress || balanceNewWalletAddress
        return Object.assign(acc, { totalFromGeneratedWalletAddresses })
      }else {
        // at first iteration acc.totalCbOutputs is expected to be undefined!
        const totalCbOutputs = acc.totalCbOutputs + +temp[1].getCoin || +temp[1].getCoin
        return Object.assign(acc, { totalCbOutputs })
      }
    }, Object.create(null)) // end reduce
      console.log(output)
      generalInfo.innerHTML +=`<br><hr>Informations for the following main address <br> <font color="cornflowerblue">${inceptionAddress}</font>`
      if(output.totalFromGeneratedWalletAddresses) {
        document.querySelector('table').style.display = 'block'
        generalInfo.innerHTML += output.totalCbOutputs && `<br>Total received (thru): <b>${output.totalCbOutputs.toLocaleString('de-DE', formatADA)}</b> ${adaSVG}`
        generalInfo.innerHTML += `<br>Balance : <b>${mainAddressBalance.toLocaleString('de-DE', formatADA)}</b> ${adaSVG}`
        const totalWalletsBalance = mainAddressBalance + output.totalFromGeneratedWalletAddresses
        generalInfo.innerHTML += `<br>Total balance for ALL addresses linked to the main address : <b>${totalWalletsBalance.toLocaleString('de-DE', formatADA)} </b> ${adaSVG}`
      } else {
        generalInfo.innerHTML += `<br>Balance : <b>${mainAddressBalance.toLocaleString('de-DE', formatADA)}</b> ${adaSVG}`
      }
    } catch (e) {
      console.warn(e)
      document.querySelector('h3').style.display = 'block'
      document.querySelector('h3').innerHTML = json && json.Left || e
      Sentry.captureException(e)
    } finally {
      document.querySelector('button').style.visibility = 'visible'
      document.querySelector('h2').innerHTML = 'Perform another query'
    }
  }
}) // end DOMContentLoaded
