<h1 align="center">Description</h1>

In this program, every effort has been made to design and implement a program that meets all the needs of the electronic exam day. The site admin can easily manage all issues, such as reviewing and managing classes, managing system students, managing students in each class, managing and designing exams, reviewing exam results, and reporting some of the admin's capabilities. On the other hand, teachers can also use this system for ease in designing questions, designing exams, and obtaining exam results. As mentioned, this system is very suitable for saving teachers' time. In such a way that even with a few clicks in the system, questions and exams can be designed, and by simply clicking once, all exam results can be viewed. Students can also take their exams in a suitable environment. A list of questions, remaining exam time, and a beautiful and suitable environment for the ease and tranquility of students during the exam have been provided. 


<h1 align="center">Installation</h1>

Here is the translation of the provided text from Farsi (Persian) to English:

1. We install Docker Desktop software. By installing this software, not only does Docker run on the server, but it also provides a graphical interface for users to easily observe events within Docker.

2. In the PowerShell section with admin access, we run the following command:
```powershell
& 'C:\Program Files\Docker\Docker\DockerCli.exe' -SwitchDaemon
```
At this stage, the Docker daemon is defined.

3. In the next steps, WSL is configured on Windows. The following commands should be run in PowerShell with admin access:
```powershell
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart

dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

wsl.exe --install
```

4. Download and install WSL from the following link on the system:
[WSL Download Link](https://wslstorestorage.blob.core.windows.net/wslblob/wsl_update_x64.msi)

5. After completing the above steps, the Docker Desktop software will be executable. If different sections of Docker Desktop are examined, tables for images, volumes, and containers are visible. Docker is ready for Docker projects to run on it.

6. Enter the directory where the project source is located in the command line and execute the following commands:
```bash
docker load -i .\redis.tar

docker load -i .\db.tar

docker load -i .\web.tar

docker load -i .\python.tar
```
By using the above commands, Docker images are created and can be viewed in the Docker Desktop software under the Images section. Note that when executing commands, make sure you are in the directory related to the files. Keep in mind that without using these commands and proceeding to step 7, Docker images related to the project can be added to Docker. However, by performing these commands, excessive downloading by Docker is avoided.

7. Then, we build the Docker images that we transferred to the system with the following command:
```bash
docker-compose build
```
Using the above command, a container is created from each image file (created in step 6), and Django libraries are imported into the "web" container. In essence, the project is compiled on the server using this command.

8. We run the Docker containers created in the previous step to start the system:
```bash
docker-compose up
```
Using the following command, we can view the containers of the system that we started in the previous step:
```bash
docker ps
```
After successfully running the project, enter the corresponding container and execute Python-related commands in this section:
```bash
docker exec -it rest_api bash
```
After the last command, enter the specific Docker command line. This is a Linux command line. By using the following command, run the migration files present in the project to successfully execute the database:
```bash
python manage.py migrate
```
With the following command, you can create a user with admin access (admin access related to Django itself):
```bash
python manage.py createsuperuser
```
If a technical user of the system wants to create these files that the system images are built on, they can achieve this by executing the following commands:
```bash
docker save -o python.tar python
docker save -o db.tar postgres
docker save -o python.tar exam-web
```

<h3 align="center">python/django developer</h3>

<p align="left"> <a href="https://github.com/ryo-ma/github-profile-trophy"><img src="https://github-profile-trophy.vercel.app/?username=sina-soleimani" alt="sina-soleimani" /></a> </p>

- I’m currently working on **online test application**

<h3 align="left">Connect with me:</h3>
<p align="left">
<a href="https://linkedin.com/in/sina soleimani" target="blank"><img align="center" src="https://raw.githubusercontent.com/rahuldkjain/github-profile-readme-generator/master/src/images/icons/Social/linked-in-alt.svg" alt="sina soleimani" height="30" width="40" /></a>
</p>

<h3 align="left">Languages and Tools:</h3>
<p align="left"> <a href="https://aws.amazon.com" target="_blank" rel="noreferrer"> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/amazonwebservices/amazonwebservices-original-wordmark.svg" alt="aws" width="40" height="40"/> </a> <a href="https://getbootstrap.com" target="_blank" rel="noreferrer"> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/bootstrap/bootstrap-plain-wordmark.svg" alt="bootstrap" width="40" height="40"/> </a> <a href="https://www.w3schools.com/css/" target="_blank" rel="noreferrer"> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/css3/css3-original-wordmark.svg" alt="css3" width="40" height="40"/> </a> <a href="https://www.djangoproject.com/" target="_blank" rel="noreferrer"> <img src="https://cdn.worldvectorlogo.com/logos/django.svg" alt="django" width="40" height="40"/> </a> <a href="https://www.docker.com/" target="_blank" rel="noreferrer"> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/docker/docker-original-wordmark.svg" alt="docker" width="40" height="40"/> </a> <a href="https://www.w3.org/html/" target="_blank" rel="noreferrer"> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/html5/html5-original-wordmark.svg" alt="html5" width="40" height="40"/> </a> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank" rel="noreferrer"> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/javascript/javascript-original.svg" alt="javascript" width="40" height="40"/> </a> <a href="https://www.mongodb.com/" target="_blank" rel="noreferrer"> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/mongodb/mongodb-original-wordmark.svg" alt="mongodb" width="40" height="40"/> </a> <a href="https://www.mysql.com/" target="_blank" rel="noreferrer"> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/mysql/mysql-original-wordmark.svg" alt="mysql" width="40" height="40"/> </a> <a href="https://www.oracle.com/" target="_blank" rel="noreferrer"> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/oracle/oracle-original.svg" alt="oracle" width="40" height="40"/> </a> <a href="https://www.postgresql.org" target="_blank" rel="noreferrer"> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/postgresql/postgresql-original-wordmark.svg" alt="postgresql" width="40" height="40"/> </a> <a href="https://www.python.org" target="_blank" rel="noreferrer"> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/python/python-original.svg" alt="python" width="40" height="40"/> </a> <a href="https://redis.io" target="_blank" rel="noreferrer"> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/redis/redis-original-wordmark.svg" alt="redis" width="40" height="40"/> </a> <a href="https://www.selenium.dev" target="_blank" rel="noreferrer"> <img src="https://raw.githubusercontent.com/detain/svg-logos/780f25886640cef088af994181646db2f6b1a3f8/svg/selenium-logo.svg" alt="selenium" width="40" height="40"/> </a> <a href="https://www.sqlite.org/" target="_blank" rel="noreferrer"> <img src="https://www.vectorlogo.zone/logos/sqlite/sqlite-icon.svg" alt="sqlite" width="40" height="40"/> </a> </p>

<p><img align="left" src="https://github-readme-stats.vercel.app/api/top-langs?username=sina-soleimani&show_icons=true&locale=en&layout=compact" alt="sina-soleimani" /></p>

<p>&nbsp;<img align="center" src="https://github-readme-stats.vercel.app/api?username=sina-soleimani&show_icons=true&locale=en" alt="sina-soleimani" /></p>
