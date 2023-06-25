const execSync = require('child_process').execSync
const path = require('path')

const run = (cmd) => {
  console.log(cmd)
  execSync(cmd)
}

exports.default = async (configuration) => {
  const { path: inputFilePath } = configuration

  const inputFilePathNoSpaces = inputFilePath.replaceAll(' ', '_')
  const fileName = path.basename(inputFilePathNoSpaces)

  console.log({ inputFilePath, inputFilePathNoSpaces, fileName })

  // Move file path to one without space since codesign tool does not support space
  if (inputFilePath !== inputFilePathNoSpaces) {
    run(`mv '${inputFilePath}' ${inputFilePathNoSpaces}`)
  }

  // Copy in file to input volume
  run(`docker cp '${inputFilePathNoSpaces}' codesign-in:/codesign/packages`)

  // Perform codesign
  // `--security-opt seccomp=unconfirmed` is necessary, see:
  // https://github.com/linuxserver/docker-nzbhydra2/issues/20#issuecomment-1119688892
  run(
    `
    export USERNAME=esigner_demo && \
    export PASSWORD=esignerDemo#1 && \
    export TOTP_SECRET=RDXYgV9qju+6/7GnMf1vCbKexXVJmUVr+86Wq/8aIGg= && \
    docker run \
      --security-opt seccomp=unconfined \
      -i --rm --dns 8.8.8.8 \
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

  // Copy out file from output volume back to host system with original file path
  run(
    `docker cp codesign-out:'/codesign/artifacts/${fileName}' '${inputFilePath}'`
  )
}
