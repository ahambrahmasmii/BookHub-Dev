import boto3
import json

client = boto3.client('events')

def handle_resource_added(event):
    """Handle the resource added event."""
    response = client.put_events(
        Entries=[
            {
                'Source': 'com.bookhub',
                'DetailType': 'ResourceAdded',
                'Detail': json.dumps(event),
                'EventBusName': 'BookhubEventBus'
            }
        ]
    )
    print(f"Resource added event published: {response}")

def handle_resource_deleted(event):
    """Handle the resource deleted event."""
    response = client.put_events(
        Entries=[
            {
                'Source': 'com.bookhub',
                'DetailType': 'ResourceDeleted',
                'Detail': json.dumps(event),
                'EventBusName': 'BookhubEventBus'
            }
        ]
    )
    print(f"Resource deleted event published: {response}")