const crypto = require('crypto')

const decryptData = (data, privateKey) => {
    
    const decryptedData = crypto.privateDecrypt({
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
        passphrase: 'Secret Variable Here'
        },
        data
    )

    return decryptedData
}

export default decryptData