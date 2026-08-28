## Tracing AI Apps

It's like monitoring in web-development, like there we use things like Prometheus, Grafana, Loki.

So, like let suppose you have big application where there are multiple backends running in their own docker instances. Now for each instance there is some logs which are getting generated so what we do?

We monitor their logs and all at one central place. Now, we have some techs to do this for us, here this loki is used to centralized our logs, prometheus is use to store the logs of the cpu and machine specs which are running behind.

Grafana provides us the service where we can make dashboards from this data and we can visualize the data of loki and prometheus.

### Ai world...

In Ai world, things are not procedural we can't tell what will happen next because in this chain AI takes decisions and that brings us the new and even more complexity. So, Monitoring and tracking this AI flow is required.

Now these above applications that we talk are not providing the tracking and monitoring support for our AI apps.

For that specific use case we have different tools in market, and one of them is "LangSmith".

Now to try this i am going to use some pre written code from prompting classes.

Langfuse is open source version of langsmith.

Langfuse is seriously good no need to use langsmith.

Langfuse have 2 types 1. there cloud version for that obviously you will pay, 2. self hosted you can self host it

And it's working so well we can move ahead. in life.
