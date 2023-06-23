const execSync = require('child_process').execSync
const path = require('path')

exports.default = async (configuration) => {
  const { path: inputFilePath } = configuration
  const fileName = path.basename(inputFilePath)

  execSync(`docker cp ${inputFilePath} codesign-volume:/codesign`)
  execSync(
    `docker run -i --rm --dns 8.8.8.8 \
    --network host \
    --volumes-from codesign-volume \
    -e USERNAME=$USERNAME \
    -e PASSWORD=$PASSWORD \
    -e CREDENTIAL_ID=$CREDENTIAL_ID \
    -e TOTP_SECRET=$TOTP_SECRET \
    -e ENVIRONMENT_NAME='TEST' \
    ghcr.io/sslcom/codesigner:latest \
    sign \
    -input_file_path=/codesign/${fileName} \
    -output_dir_path=/codesign/artifacts`
  )
  execSync(
    `docker cp codesign-volume:/codesign/artifacts/${fileName} ${inputFilePath}`
  )
}
