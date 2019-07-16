:: webjars官方还没来得及打包2.10.1的element-ui，所以自己打包了一个。
call mvn install:install-file -Dfile=element-ui-2.10.1.jar -DgroupId=org.webjars.npm -DartifactId=element-ui -Dversion=2.10.1 -Dpackaging=jar

