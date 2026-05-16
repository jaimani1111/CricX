@REM ----------------------------------------------------------------------------
@REM Licensed to the Apache Software Foundation (ASF) under one
@REM or more contributor license agreements.
@REM ----------------------------------------------------------------------------
@REM Begin all REM://

@echo off
@REM Set the current directory to the location of this script
set WRAPPER_LAUNCHER=.mvn/wrapper/maven-wrapper.jar

@REM Download maven-wrapper.jar if not present
if not exist "%WRAPPER_LAUNCHER%" (
    echo Downloading Maven Wrapper...
    powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.3.2/maven-wrapper-3.3.2.jar' -OutFile '%WRAPPER_LAUNCHER%'"
)

@REM Find java.exe
set JAVA_EXE=java.exe
if defined JAVA_HOME goto findJavaFromJavaHome
goto execute

:findJavaFromJavaHome
set JAVA_HOME=%JAVA_HOME:"=%
set JAVA_EXE=%JAVA_HOME%/bin/java.exe
if exist "%JAVA_EXE%" goto execute
echo ERROR: JAVA_HOME is set to an invalid directory: %JAVA_HOME%
goto error

:execute
"%JAVA_EXE%" %MAVEN_OPTS% -jar "%WRAPPER_LAUNCHER%" %*
if ERRORLEVEL 1 goto error
goto end

:error
set ERROR_CODE=1

:end
exit /b %ERROR_CODE%
