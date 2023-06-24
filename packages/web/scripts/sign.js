const execSync = require('child_process').execSync
const path = require('path')

const run = (cmd) => {
  console.log(cmd)
  execSync(cmd)
}

exports.default = async (configuration) => {
  const { path: inputFilePath } = configuration
  const fileName = path.basename(inputFilePath)
  console.log({ inputFilePath, fileName })

  run(`docker cp '${inputFilePath}' codesign-in:/codesign/packages`)
  run(
    `
    export USERNAME=esigner_demo && \
    export PASSWORD=esignerDemo#1 && \
    export TOTP_SECRET=RDXYgV9qju+6/7GnMf1vCbKexXVJmUVr+86Wq/8aIGg= && \
    docker run -i --rm --dns 8.8.8.8 \
    --network host \
    --volumes-from codesign-in \
    --volumes-from codesign-out \
    -e USERNAME=$USERNAME \
    -e PASSWORD=$PASSWORD \
    -e TOTP_SECRET=$TOTP_SECRET \
    -e ENVIRONMENT_NAME='TEST' \
    ghcr.io/sslcom/codesigner:latest \
    sign \
    -input_file_path='/codesign/packages/${fileName}' \
    -output_dir_path=/codesign/artifacts`
  )
  run(
    `docker cp codesign-out:'/codesign/artifacts/${fileName}' '${inputFilePath}'`
  )
}
