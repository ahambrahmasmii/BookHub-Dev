import boto3
import json

eventbridge = boto3.client('events')

def publish_event(event_name: str, detail: dict):
    response = eventbridge.put_events(
        Entries=[
            {
                'Source': 'com.bookhub',
                'DetailType': event_name,
                'Detail': json.dumps(detail),
                'EventBusName': 'BookHubEventBus'  # Replace with your event bus name
            }
        ]
    )
    return response