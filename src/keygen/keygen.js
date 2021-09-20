const crypto = require('crypto')

const generateKeyPair = () => {

    crypto.generateKeyPair('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: {
            type: 'pkcs1',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem',
            cipher: 'aes-256-cbc',
            passphrase: 'Secret Variable Here'
        }
    }, (err, publicKey, privateKey) => {
        if(err) {
            console.log(err)
        } else {
    
            const keyObject = {
                privateKey: privateKey,
                publicKey: publicKey
            }
    
            return keyObject
    
        }
    })
    
}

export default generateKeyPair

