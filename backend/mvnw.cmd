@ECHO OFF
SETLOCAL

SET "MAVEN_VERSION=3.9.6"
SET "MAVEN_DIST=apache-maven-%MAVEN_VERSION%"
SET "MAVEN_ZIP=%MAVEN_DIST%-bin.zip"
SET "MAVEN_URL=https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/%MAVEN_VERSION%/%MAVEN_ZIP%"
SET "WRAPPER_DIR=%USERPROFILE%\.m2\wrapper\dists\%MAVEN_DIST%"
SET "MAVEN_HOME=%WRAPPER_DIR%\%MAVEN_DIST%"
SET "MVN_CMD=%MAVEN_HOME%\bin\mvn.cmd"

IF EXIST "%MVN_CMD%" GOTO run

ECHO Maven %MAVEN_VERSION% not found in wrapper cache. Downloading...
IF NOT EXIST "%WRAPPER_DIR%" MKDIR "%WRAPPER_DIR%"

powershell -NoProfile -Command ^
  "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; " ^
  "(New-Object Net.WebClient).DownloadFile('%MAVEN_URL%', '%WRAPPER_DIR%\%MAVEN_ZIP%')"

IF NOT EXIST "%WRAPPER_DIR%\%MAVEN_ZIP%" (
    ECHO ERROR: Failed to download Maven. Check your internet connection.
    EXIT /B 1
)

ECHO Extracting Maven...
powershell -NoProfile -Command ^
  "Expand-Archive -Path '%WRAPPER_DIR%\%MAVEN_ZIP%' -DestinationPath '%WRAPPER_DIR%' -Force"

IF NOT EXIST "%MVN_CMD%" (
    ECHO ERROR: Maven extraction failed.
    EXIT /B 1
)

ECHO Maven %MAVEN_VERSION% ready.

:run
SET "JAVA_HOME_BIN=%JAVA_HOME%\bin\java.exe"
IF NOT EXIST "%JAVA_HOME_BIN%" (
    ECHO ERROR: JAVA_HOME is not set or java.exe not found at %JAVA_HOME_BIN%
    EXIT /B 1
)

"%MVN_CMD%" %*
ENDLOCAL
