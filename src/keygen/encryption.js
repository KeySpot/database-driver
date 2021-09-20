const crypto = require('crypto')

const encryptData = (data, publicKey) => {
    
    const encryptedData = crypto.publicEncrypt({
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256"
        },
        Buffer.from(JSON.stringify(data))
    )

    return encryptedData
}

export default encryptData